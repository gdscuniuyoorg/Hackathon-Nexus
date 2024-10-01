const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

//Our middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new AppError('Failed to extract text from PDF', 400);
  }
}


async function extractTextFromImage(filePath) {
	let worker;
	try {
		worker = await createWorker('eng');
		const ret = await worker.recognize(filePath);
		if (ret.data.text !== "") {
			return ret.data.text;
		} else {
			throw new Error('No text found in the image');
		}
	} catch (error) {
		throw new AppError('Failed to extract text from Image', 400);
	} finally {
		if (worker) {
			await worker.terminate();
		}
	}
};


app.post('/upload', upload.array('files'), async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    let combinedText = '';

    for (const file of files) {
      if (file.mimetype === 'application/pdf') {
        const text = await extractTextFromPDF(file.path);
        combinedText += text + '\n\n';
      } else if (file.mimetype.startsWith('image/')) {
        combinedText += await extractTextFromImage(file.path);
		// console.log(combinedText);
      } else {
        throw new AppError('Unsupported file type', 400);
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze the following document:

    ${combinedText}

    Based on this content, generate 10 questions:
    - The first 5 questions should be relatively easy, covering basic information and main ideas from the document.
    - The next 5 questions should be more difficult, requiring deeper understanding or synthesis of information from different parts of the document.

    Format each question as a JSON object with the following structure:
    {
      "question": "The question text",
      "difficulty": "easy" or "difficult",
      "correctAnswer": "The correct answer to the question"
    }

    Return the questions as a JSON array, make sure it RETURNS ONLY AND STRICTLY JSON, YOU DONT NEED TO SAY ANYTHING, JUST GIVE ME WHAT I NEED IN JSON, DON'T SAY ANYTHING IN ADDITION.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
	console.log(response.text())
    const generatedQuestions = JSON.parse(response.text());

    res.json({ questions: generatedQuestions });
  } catch (error) {
    console.error('Error:', error);
    next(error);
  } finally {
    // Clean up uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
  }
});

app.post('/validate-answer', async (req, res, next) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      throw new AppError('Question and user answer are required', 400);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Question: ${question.question}
    Correct Answer: ${question.correctAnswer}
    User Answer: ${userAnswer}

    Evaluate if the user's answer is correct. Consider the following:
    1. The answer doesn't need to be word-for-word identical to the correct answer.
    2. Look for key concepts and main ideas in the user's answer.
    3. If the user's answer captures the essence of the correct answer, consider it correct.
    4. Flag answer like "I dont remember", "I dont know", etc as Incorrect

    Respond with a JSON object in the following format:
    {
      "result": "Correct" or "Incorrect",
      "explanation": "A brief explanation of why the answer is correct or incorrect"
    }

    RETURN ONLY THE JSON OBJECT, NO ADDITIONAL TEXT.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const evaluation = JSON.parse(response.text());

    res.json(evaluation);
  } catch (error) {
    console.error('Error:', error);
    next(error);
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});