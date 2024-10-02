# Exams Preparation Engine

## Overview
The Exams Preparation Engine is a unique and systematic tool designed to assist students in their academic pursuits by helping them study and prepare for exams. The engine accepts various file formats (PDF, images, Word Documents and text files) as input, processes the contents, generates potential examination questions based on the content, and allows the students to answer those questions. The system simulates an exam environment, evaluates the student’s answers, and provides feedback with correct answers and an overall score.

By using this tool, students can see how well they understand the material and how likely they are to score good grades in their field of study.

---

## Features

### 1. File Upload Page:
- A user-friendly interface where students can upload files in different formats:
  - PDF: Course materials, textbooks, etc.
  - Images: Scanned notes or images of documents.
  - Text Files: Plain `.txt` files with course-related content.
  - Word Documents: Word Documents which might also be a part of students resource material

### 2. Backend Processing:
- Text Extraction: 
  - For PDFs, word docs and text files, the system extracts the text directly.
  - For images and scanned PDFs, Optical Character Recognition (OCR) is applied to extract text from the image content.
  
### 3. Question Generation:
- Based on the extracted content, the engine generates questions. These questions are categorized by difficulty levels (easy, medium, hard and mixed) to provide a balanced test.
  
### 4. Exam-Like Environment:
- The student can answer the generated questions in an interactive exam environment on the frontend.
  
### 5. Grading and Feedback:
- At the end of the exam, an overall score is displayed to show how well the student performed including the correct answers for questions failed.

---

## Technologies Used

### Frontend:
- React.js: Handles the user interface (UI) and interactions such as uploading files, displaying questions, and showing results.

### Backend:
- Node.js (Express.js): Provides an API to handle file uploads, text extraction, question generation, and OCR processing.

---

## Project Structure

```
exams-preparation-engine/
├─  server/                    
│   ├── index.js				# Main entry
│   ├── .env                
│   ├── uploads/				# Temporary upload directory
├── ├── package.json                # Dependencies and project metadata
│
├── client/                   	# React frontend for the exam interface
│   ├── src/                    # Main frontend source folder
├── ├── package.json                # Dependencies and project metadata
│
└── README.md                   # Project description and instructions
```

---

## Installation and Setup

### 1. Clone the repository
To start with the project, first clone the repository to your local machine:
```bash
git clone https://github.com/gdscuniuyoorg/Hackathon-Nexus.git
cd Hackathon-Nexus
```

### 2. Install dependencies

#### Backend:
Navigate to the server directory and install the dependencies using `npm`:
```bash
cd server
npm install
```

#### Frontend:
Navigate to the client directory and install the dependencies:
```bash
cd ../client
npm install
```

### 3. Configure environment variables
Create a `.env` file in the `server` folder to store sensitive data such as API keys and environment variables. Include the following:

```bash
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gpt_api_key_here
```

### 4. Start the Application

#### Backend:
Run the backend server from the `server` directory [terminal 0]:
```bash
npm start
```

#### Frontend:
Run the frontend development server from the `client` directory [terminal 1]:
```bash
npm start
```

### 5. Access the Application
Once both servers are running, open a browser and go to:
```
http://localhost:3000
```

---

## Usage

1. Upload a File: 
   - On the main page, upload a file (PDF, image, Word Doc, or text file).
   
2. File Processing: 
   - The file is sent to the backend, where it is processed to extract content. For image-based PDFs and images, OCR is used to extract text.

3. Generate Questions: 
   - Questions are automatically generated from the extracted content.

4. Answer the Questions: 
   - Take the test in an exam-like environment where you can submit answers to the generated questions.

5. Get Feedback: 
   - After completing the exam, receive a final score that reflects your performance and view the correct answers, optionally download for future reference. 

---

## API Endpoints

### POST `/upload`
- Description: Uploads a file (PDF, Word Document, image, or text file) to the server for processing.
- Request: Multipart form data containing the file.
- Response: JSON response containing generated questions.

### POST `/validate-answer`
- Description: Validates the student’s answer and checks if it matches the correct answer.
- Request: JSON body containing the question and the user's answer.
- Response: JSON object indicating if the answer was correct or incorrect.

---

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## Contact

For any inquiries or suggestions, please feel free to reach out to the Team:

Wiseman Umanah <wisemanumanah@gmail.com>
God's power Maurice <verbosetwomillion@gmail.com>
Habib Adebayo <adebayohabib7@gmail.com>

---

