const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { createWorker } = require('tesseract.js');
const mammoth = require('mammoth');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;


app.use(express.json());
app.use(cors());


class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function cleanText(text) {
	return text
	  .replace(/\s\s+/g, ' ')
	  .replace(/\n+/g, ' ')
	  .trim();             
  }


async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text || "No text found in PDF.";
}

async function extractTextFromImage(buffer, mimetype) {
  const worker = await createWorker('eng');

  const supportedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp', 'image/tiff'];

  if (!supportedFormats.includes(mimetype)) {
    throw new AppError('Unsupported image format. Please use PNG, JPEG, BMP, or TIFF.', 400);
  }

  try {
    const { data: { text } } = await worker.recognize(buffer);
    return text;
  } catch(error) {
	 throw new AppError('Error in processing Image', 400);
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromDocx(buffer) {
  const { value: text } = await mammoth.extractRawText({ buffer });
  return text;
}

async function extractTextFromTxt(buffer) {
  return buffer.toString();
}


async function AiResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text(); 
  } catch (error) {
    console.error('Error with Gemini Chat API:', error);
    throw new AppError('Failed to generate questions using Gemini Chat API', 500);
  }
}


app.post('/upload', upload.array('files'), async (req, res, next) => {
	try {
	  const { files } = req;
	  const { numQuestions, difficulty } = req.query;
		
	  
	  if (!files || files.length === 0) throw new AppError('No files uploaded', 400);
	  if (!numQuestions || !difficulty) throw new AppError('Missing numQuestions or difficulty', 400);
  
	  let combinedText = '';
  
	  for (const file of files) {
		const { buffer, mimetype } = file;
		let i = 1;
		let extractedText = '';
		if (mimetype === 'application/pdf') {
		  const text = await extractTextFromPDF(buffer);
		  extractedText = `\n\n[PDF Content ${i}]\n\n${text}`;
		} else if (mimetype.startsWith('image/')) {
		  const text = await extractTextFromImage(buffer, mimetype);
		  extractedText = `\n\n[Image Content ${i}]\n\n${text}`;
		} else if (mimetype === 'text/plain') {
		  const text = await extractTextFromTxt(buffer);
		  extractedText = `\n\n[Text File Content ${i}]\n\n${text}`;
		} else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
		  const text = await extractTextFromDocx(buffer);
		  extractedText = `\n\n[DOCX Content ${i}]\n\n${text}`;
		} else {
		  throw new AppError('Unsupported file type', 400);
		}
		i++;
	
		combinedText += cleanText(extractedText) + ' ';
	  }
  
	
	//   console.log(`Total combined text length: ${combinedText.length} characters`);
  
	  
	  const prompt = `
		Based on each of the following document content:
		${combinedText}, if it is empty, "questions" should be an empty array
		Generate ${numQuestions} questions of ${difficulty} difficulty.
		Format the response as:
		{
		  "preview": "A short summary of the each content of the document e.g the first document.., the second document.. down to the last document",
		  "questions": [
			{ "question": "The question text", "difficulty": "${difficulty}", "correctAnswer": "The correct answer" }
		  ]
		}
	  `;
  
	  // Generate questions using the Gemini API chat
	  const response = await AiResponse(prompt);
	  res.json({ data: JSON.parse(response) });
  
	} catch (error) {
	  console.error('Error processing files:', error);
	  next(error);
	}
  });
  

  app.post('/validate-answer', async (req, res, next) => {
	try {
	  const { question, correctAnswer, userAnswer } = req.body;
  
	  if (!question || !correctAnswer || !userAnswer) {
		throw new AppError('Missing question, correctAnswer, or userAnswer in request body', 400);
	  }
  
	  const prompt = `
		Question: ${question}
		Correct Answer: ${correctAnswer}
		User's Answer: ${userAnswer}
  
		Evaluate if the user's answer is correct. 
		The user's answer doesn't need to be word-for-word identical to the correct answer, but it should capture the essence of the correct answer. 
		Provide your evaluation in the following format:
		{
		  "result": "Correct" or "Incorrect",
		  "explanation": ${correctAnswer}
		}
	  `;
  
	  const response = await AiResponse(prompt);
  
	  const validation = JSON.parse(response);
	  res.json(validation);
	} catch (error) {
	  console.error('Error validating answer:', error);
	  next(error);
	}
  });
  

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
