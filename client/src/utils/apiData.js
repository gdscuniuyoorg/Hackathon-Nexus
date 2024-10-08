const apiData = () => {
  const curlCode = `curl -X POST "http://localhost:3001/upload?numQuestions={number of questions needed}&difficulty={ quiz difficulty }" \\
-F "files=@/path/to/file"`;

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

Quiz();`;

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
        print("Error:", response.status_code, response.text)`;

  const validateCurlCode = `curl -X POST http://localhost:3001/validate-answer \\
-H "Content-Type: application/json" \\
-d '{
        "question": "The question",
        "correctAnswer": "The correct answer",
        "userAnswer": "The user's answer"
    }'`;

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
})();`;

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
	print("Error:", response.status_code, response.text)`;

  const jsonResOne = `{
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
  }`;
  return {
    curlCode,
    jsCode,
    pythonCode,
    validateCurlCode,
    validateJsCode,
    validatePythonCode,
    jsonResOne,
  };
};

export default apiData;
