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
const mammoth = require('mammoth');


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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function sendQuestions(combinedText, numQuestions, difficulty) {
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
	return response.text()
}


async function confirmAnswer(question, correctAnswer, userAnswer) {
	const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Question: ${question}
    Correct Answer: ${correctAnswer}
    User Answer: ${userAnswer}

    Evaluate if the user's answer is correct. Consider the following:
    1. The answer doesn't need to be word-for-word identical to the correct answer.
    2. Look for key concepts and main ideas in the user's answer.
    3. If the user's answer captures the essence of the correct answer, consider it correct.
    4. Flag answer like "I dont remember", "I dont know", etc as Incorrect

    Respond with a JSON object in the following format:
    {
      "result": "Correct" or "Incorrect",
      "explanation": ${correctAnswer}
    }

    RETURN ONLY THE JSON OBJECT, NO ADDITIONAL TEXT.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}


async function extractTextFromPDF(dataBuffer) {
  try {
    const data = await pdf(dataBuffer);
	if (!data.text.trim()) {
		throw new AppError('No text found in PDF', 400);
	  }
  
	  // Return the extracted text for text-based PDFs
	// console.log(data.text);
    return data.text;
  } catch (error) {
    throw new AppError('Failed to extract text from PDF', 400);
  }
}


async function extractTextFromImage(buffer) {
	let worker;
	try {
		worker = await createWorker('eng');
		const ret = await worker.recognize(buffer);
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


async function extractTextFromTxt(buffer) {
    try {
        return buffer.toString();
    } catch (error) {
        throw new AppError('Failed to extract text from Text file', 400);
    }
}


async function extractTextFromDocx(buffer) {
  try {
    const { value: text } = await mammoth.extractRawText({ buffer });
    return text;
  } catch (error) {
    throw new Error('Failed to extract text from DOCX file');
  }
}


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

	  const buffer = file.buffer; // Get the file buffer
      const mimetype = file.mimetype;

      if (mimetype === 'application/pdf') {
        const text = await extractTextFromPDF(buffer);
        combinedText += text + '\n\n';
      } else if (mimetype.startsWith('image/')) {
        const text = await extractTextFromImage(buffer);
		combinedText += text + '\n\n';
      }  else if (mimetype === 'text/plain') {
		const text = await extractTextFromTxt(buffer);
        combinedText += text + '\n\n';
	  } else  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
		// Handle both .docx and .doc
		const text = await extractTextFromDocx(buffer);
		combinedText += text + '\n\n';
	  } else {
        throw new AppError('Unsupported file type', 400);
      }
    }

	let generatedQuestions;

	/* Tries to check if any error occurs while trying to get questions,
	* if there's a problem probably in JSON.parse() i.e in Ai sending wrong format
	* We try again upto get 5 times until the right format is gotten.
	*/
	for (let i = 0; i < 5; i++) { 
		try {
			let temp = await sendQuestions(combinedText, numQuestions, difficulty);
			
			generatedQuestions = JSON.parse(temp);
			break;
		} catch (error) {
			console.error(`Attemptted ${i + 1} times`);
			
			if (i === 4) {
				throw new AppError("Cannot generate question for the files sent", 400);
			}
		}
	}

    res.json({ data : generatedQuestions });
  } catch (error) {
    console.error('Error:', error);
    next(error);
  }
});


app.post('/validate-answer', async (req, res, next) => {
	try {
	  const { question, correctAnswer, userAnswer } = req.body;
  
	  if (!correctAnswer || !userAnswer) {
		throw new AppError('Question and user answer are required', 400);
	  }
  
	let evaluation;
	for (let i = 0; i < 5; i++) { 
		try {
			let temp = await confirmAnswer(question, correctAnswer, userAnswer);
			
			evaluation = JSON.parse(temp);
			break;
		} catch (error) {
			console.error(`Attempted ${i + 1} times`);
			
			if (i === 4) {
				throw new AppError("Error in evaluation", 400);
			}
		}
	}

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