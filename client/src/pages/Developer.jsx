import React, { useState, useEffect } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { Copy, Moon, Sun } from "lucide-react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs"

const Developer = () => {
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [copiedJs, setCopiedJs] = useState(false)
  const [copiedPython, setCopiedPython] = useState(false)
  const [copiedValidateCurl, setCopiedValidateCurl] = useState(false)
  const [copiedValidateJs, setCopiedValidateJs] = useState(false)
  const [copiedValidatePython, setCopiedValidatePython] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.body.className = `theme-${theme}`
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const curlCode = `curl -X POST "http://localhost:3001/upload?numQuestions={number of questions needed}&difficulty={ quiz difficulty }" \\
-F "files=@/path/to/file"`

  const jsCode = `const fs = require('fs');
const fetch = require('node-fetch'); // Make sure to have node-fetch installed
const FormData = require('form-data'); // Make sure to have form-data installed

async function Quiz() {
    const filePath = '/path/to/file'; // Path to the PDF file to upload
    const formData = new FormData();
    formData.append('files', fs.createReadStream(filePath));

    // Construct query parameters
    const params = new URLSearchParams({
        numQuestions: number of questions needed,
        difficulty: 'Question difficulty'
    }).toString();

        const response = await fetch(\`http://localhost:3001/upload?\${params}\`, {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders(),
            },
        });

        const data = await response.json();
        console.log('Quiz data:', data);
}

Quiz();`

  const pythonCode = `import requests
  
params = {
           "numQuestions": number of questions,
           "difficulty": "Question difficulty"
       }
files = {
           "files": open("adobe_text_rendering.png", "rb")
       }
response = requests.post("http://localhost:3001/upload", files=files, params=params)
  
if response.status_code == 200:
	print("Response:", response.json())
else:
        print("Error:", response.status_code, response.text)`

  const validateCurlCode = `curl -X POST http://localhost:3001/validate-answer \\
-H "Content-Type: application/json" \\
-d '{
        "question": "The question",
        "correctAnswer": "The correct answer",
        "userAnswer": "The user's answer"
    }'`

  const validateJsCode = `const payload = {
    question: "The question",
    correctAnswer: "The correct answe",
    userAnswer: "the user answer"
  };

(async function() {
	const response = await fetch('http://localhost:3001/validate-answer', {
	      method: 'POST',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify(payload)
	});
	const data = await response.json();
	console.log('Validation Result:', data);
})();`

  const validatePythonCode = `headers = {
        "Content-Type": "application/json"
    }
payload = {
            "question": "The question",
            "correctAnswer": "The correct answer",
            "userAnswer": "The user's answer"
        }
response = requests.post("http://localhost:3001/validate-answer", json=payload, headers=headers)
if response.status_code == 200:
	print("Validation Result:", response.json())
else:
	print("Error:", response.status_code, response.text)`

  return (
    <section className="dev max-w-4xl mx-auto px-4 py-8">
      <div className="header">
        <h1 className="text-3xl font-bold">Developer's Page</h1>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-primary text-white">
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">QuestionQuiz - Exams Preparation Engine API</h2>
        <p>
          QuestionQuiz is a powerful tool designed to help developers and students interact programmatically with our quiz and examination preparation system. The API allows users to upload various document formats (PDF, images, text files, DOC/DOCX) and automatically generate questions, quizzes, and answers based on the content. It also includes capabilities for validating user responses, giving immediate feedback—all without needing a login system.
        </p>
        <h3 className="text-xl font-semibold">This API is ideal for:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Educational Platforms: Integrate it into e-learning platforms for dynamic quiz generation and testing.</li>
          <li>Student Assistance Tools: Create apps that help students practice exams based on their own study materials.</li>
          <li>Developers and Hackathon Teams: Integrate advanced quiz generation features into applications with ease.</li>
        </ul>
        <h3 className="text-xl font-semibold">Document Upload and Processing:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Accepts multiple file formats including PDF, images (PNG, JPEG, etc.), text files (TXT), and Word documents (DOC/DOCX).</li>
          <li>Automatically extracts text from uploaded documents using Optical Character Recognition (OCR) and text parsing technologies.</li>
        </ul>
        <h3 className="text-xl font-semibold">Quiz Generation:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>AI-powered question generation based on document content.</li>
          <li>Configurable difficulty levels (easy, medium, hard, mixed) and customizable question counts for each quiz.</li>
          <li>Adaptive and dynamic quizzes that adjust based on user performance.</li>
        </ul>
        <h3 className="text-xl font-semibold">Answer Validation:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Validates user responses against the correct answers generated by the AI.</li>
          <li>Uses semantic analysis to determine whether user responses are correct, even if the wording differs from the expected answer.</li>
        </ul>
        <h2 className="text-2xl font-semibold">Getting Started</h2>
        <p>Make Your First API Call: Use our quick start guide to make your first request.</p>
        <h3 className="text-xl font-semibold">POST /upload: Upload files for quiz generation.</h3>
        <p>Description: Accepts files (PDF, images, text, DOC/DOCX) and processes them to extract content and generate quiz questions.</p>
        <h4 className="text-lg font-semibold">Request Parameters:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>numQuestions: The number of questions to generate.</li>
          <li>difficulty: The difficulty level of the questions (easy, medium, hard, mixed).</li>
        </ul>
        <h4 className="text-lg font-semibold">Request Form:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li>files: The path to the file.</li>
        </ul>
        <div className="space-y-4">
          <div className="relative">
            <CopyToClipboard text={curlCode} onCopy={() => setCopiedCurl(true)}>
              <button className="absolute top-2 right-2 p-2 bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
                <span className="sr-only">{copiedCurl ? "Copied!" : "Copy"}</span>
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter language="bash" style={dracula}>
              {curlCode}
            </SyntaxHighlighter>
          </div>
          <div className="relative">
            <CopyToClipboard text={jsCode} onCopy={() => setCopiedJs(true)}>
              <button className="absolute top-2 right-2 p-2 bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
                <span className="sr-only">{copiedJs ? "Copied!" : "Copy"}</span>
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter language="javascript" style={dracula}>
              {jsCode}
            </SyntaxHighlighter>
          </div>
          <div className="relative">
            <CopyToClipboard text={pythonCode} onCopy={() => setCopiedPython(true)}>
              <button className="absolute top-2 right-2 p-2 bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
                <span className="sr-only">{copiedPython ? "Copied!" : "Copy"}</span>
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter language="python" style={dracula}>
              {pythonCode}
            </SyntaxHighlighter>
          </div>
        </div>
        <h4 className="text-lg font-semibold">Response Type</h4>
        <SyntaxHighlighter language="json" style={dracula}>
          {`{
  "data": {
    "preview": "The document lists various trademarks and their respective owners, including Adobe products, operating systems like Windows and macOS, and fonts like Helvetica and Times.",
    "questions": [
      {
        "question": "Which company owns the trademark for the font 'Helvetica'?",
        "difficulty": "medium",
        "correctAnswer": "Linotype-Hell AG and/or its subsidiaries"
      },
      {
        "question": "What is the trademark of the World Wide Web Consortium?",
        "difficulty": "medium",
        "correctAnswer": "SVG"
      }
    ]
  }
}`}
        </SyntaxHighlighter>
        <h3 className="text-xl font-semibold">POST /validate-answer: Validate user answers.</h3>
        <p>Description: Intelligently compares user-provided answers with the correct answer</p>
        <h4 className="text-lg font-semibold">Request Body: The question, correct answer, and user's answer in JSON format.</h4>
        <SyntaxHighlighter language="json" style={dracula}>
          {`{
  "question": "The question to validate.",
  "correctAnswer": "The correct answer to the question.",
  "userAnswer": "The user's answer."
}`}
        </SyntaxHighlighter>
        <h4 className="text-lg font-semibold">Making Request</h4>
        <div className="space-y-4">
          <div className="relative">
            <CopyToClipboard text={validateCurlCode} onCopy={() => setCopiedValidateCurl(true)}>
              <button className="absolute top-2 right-2 p-2 bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
                <span className="sr-only">{copiedValidateCurl ? "Copied!" : "Copy"}</span>
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter language="bash" style={dracula}>
              {validateCurlCode}
            </SyntaxHighlighter>
          </div>
          <div className="relative">
            <CopyToClipboard text={validateJsCode} onCopy={() => setCopiedValidateJs(true)}>
              <button className="absolute top-2 right-2 p-2 bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
                <span className="sr-only">{copiedValidateJs ? "Copied!" : "Copy"}</span>
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter language="javascript" style={dracula}>
              {validateJsCode}
            </SyntaxHighlighter>
          </div>
          <div className="relative">
            <CopyToClipboard text={validatePythonCode} onCopy={() => setCopiedValidatePython(true)}>
              <button className="absolute top-2 right-2 p-2 bg-gray-800 rounded">
                <Copy className="w-4 h-4" />
                <span className="sr-only">{copiedValidatePython ? "Copied!" : "Copy"}</span>
              </button>
            </CopyToClipboard>
            <SyntaxHighlighter language="python" style={dracula}>
              {validatePythonCode}
            </SyntaxHighlighter>
          </div>
        </div>
        <h4 className="text-lg font-semibold">Response Type:</h4>
        <SyntaxHighlighter language="json" style={dracula}>
          {`{
  "result": "Correct",
  "explanation": "Adobe is the shortened name of Adobe Systems Incorporated."
}`}
        </SyntaxHighlighter>
        <p>
          This API documentation provides you with everything you need to start integrating the Exams Preparation Engine into your projects. With easy-to-use endpoints, powerful AI capabilities, and flexible quiz generation options, you'll have the tools to build innovative and engaging educational experiences. Happy Hacking 😀!
        </p>
      </div>
    </section>
  )
}

export default Developer