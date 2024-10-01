const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const natural = require('natural');
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
	if (!data.text.trim()) {
		console.log('No text found in PDF, attempting OCR...');
		
		// Use OCR to extract text from each image in the PDF
		const imagesText = await extractTextFromImage(filePath);
		return imagesText;
	  }
  
	  // Return the extracted text for text-based PDFs
	console.log(data.text);
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


// Using Jaro-Winkler for string similarity comparison
function loadModelAndCompare(correctAnswer, userAnswer) {
  const similarity = natural.JaroWinklerDistance(correctAnswer.toLowerCase(), userAnswer.toLowerCase());

  return similarity; // Similarity score between 0 and 1
}

const isAnswerSemanticallySimilar = (correctAnswer, userAnswer) => {
  const similarity = loadModelAndCompare(correctAnswer, userAnswer);

  // Define your threshold for similarity (e.g., 0.75 means 75% similar)
  return similarity > 0.50;
};


app.post('/upload', upload.array('files'), async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

	const numQuestions = req.query.numQuestions;
    const difficulty = req.query.difficulty;

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

    Based on this content, generate ${numQuestions} questions:
    - The questions should be based on the difficult ${difficulty}, requiring deeper understanding or synthesis of information from different parts of the document.

	I need the data in this format:
	{
		"preview": "A short description, overview of preview of the document.",
		"questions": [
			{
				"question": "The question text",
				"difficulty": ${difficulty},
				"correctAnswer": "The correct answer to the question"
			}
		]
	}
	
    Format each question as a JSON object with the following structure:
    {
      "question": "The question text",
      "difficulty": ${difficulty},
      "correctAnswer": "The correct answer to the question"
    }

    Return the questions as a JSON array, make sure it RETURNS ONLY AND STRICTLY JSON, YOU DONT NEED TO SAY ANYTHING, JUST GIVE ME WHAT I NEED IN JSON, DON'T SAY ANYTHING IN ADDITION. AND MAINTAIN THE SPECIFY DATA FORMAT
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
	// console.log(response.text())
    const generatedQuestions = JSON.parse(response.text());

    res.json({ data : generatedQuestions });
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
	  const { correctAnswer, userAnswer } = req.body;
  
	  if (!correctAnswer || !userAnswer) {
		throw new AppError('Question and user answer are required', 400);
	  }
  
	  // Use the NLP comparison
	  const isCorrect = await isAnswerSemanticallySimilar(correctAnswer, userAnswer);
  
	  // Respond with validation result
	  const validationResult = {
		result: isCorrect ? 'Correct' : 'Incorrect',
		explanation: isCorrect ? 'Great job!' : `The correct answer was: ${correctAnswer}`
	  };
  
	  res.json(validationResult);
	} catch (error) {
	  console.error('Error:', error);
	  next(error);
	}
  });

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});