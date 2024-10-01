import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader, ChevronRight, CheckCircle, AlertCircle, Moon, Sun, Download, Brain, Book, Zap, Settings, BarChart, Eye, ArrowLeft, HelpCircle, X } from 'lucide-react';
import { usePDF } from 'react-to-pdf';

export default function Component() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [previewText, setPreview] = useState('');
  const [files, setFiles] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSettings, setQuizSettings] = useState({ numQuestions: 10, difficulty: 'mixed' });
  const [overallProgress, setOverallProgress] = useState({ quizzesTaken: 0, averageScore: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [score, setScore] = useState(0);

  const { toPDF, targetRef } = usePDF({
    filename: 'quiz_results.pdf',
  });

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFiles([...event.dataTransfer.files]);
  };

  const handleSubmit = async () => {
	setIsLoading(true);
	setError(null);
	setUploadProgress(0);
  
	const formData = new FormData();
	files.forEach((file) => formData.append('files', file));
  
	// Construct the query parameters
	const params = new URLSearchParams({
	  numQuestions: quizSettings.numQuestions,
	  difficulty: quizSettings.difficulty,
	}).toString();
  
	try {
	  const response = await fetch(`http://localhost:3001/upload?${params}`, {
		method: 'POST',
		body: formData,
		onUploadProgress: (progressEvent) => {
			const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
			setUploadProgress(percentCompleted);
		},
	  });
  
	  if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Failed to upload files');
	  }
  
	  const data = await response.json();
	  
	  setQuestions(data.data.questions.slice(0, quizSettings.numQuestions));

	  setPreview(data.data.preview);

	  setCurrentStep('preview');
	} catch (error) {
	  setError(error.message || 'An error occurred while processing your files. Please try again.');
	} finally {
	  setIsLoading(false);
	}
  };
  

  const handleAnswerSubmit = async (answer) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/validate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correctAnswer: questions[currentQuestionIndex].correctAnswer,
          userAnswer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate answer');
      }

      const data = await response.json();
      const isCorrect = data.result === 'Correct';
	  const explanation = data.explanation;

      setUserAnswers([...userAnswers, { question: questions[currentQuestionIndex].question, answer, isCorrect, explanation }]);
      
      if (isCorrect) {
        setScore(score + 1);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true);
        setCurrentStep('results');
        updateOverallProgress();
      }
    } catch (error) {
      setError(error.message || 'An error occurred while validating your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOverallProgress = () => {
    const newQuizzesTaken = overallProgress.quizzesTaken + 1;
    const newAverageScore = ((overallProgress.averageScore * overallProgress.quizzesTaken) + calculateScore()) / newQuizzesTaken;
    setOverallProgress({ quizzesTaken: newQuizzesTaken, averageScore: newAverageScore });
  };

  const calculateScore = () => {
    return (score / questions.length) * 100;
  };

  const HelpContent = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Help & FAQ</h2>
          <button onClick={() => setShowHelp(false)} className="text-2xl">&times;</button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">How to use QuestionGenius</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Upload your documents (PDF or images)</li>
              <li>Our AI will generate questions based on your content</li>
              <li>Customize your quiz settings</li>
              <li>Answer the questions to test your knowledge</li>
              <li>Review your results and track your progress</li>
            </ol>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">FAQ</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">What file types are supported?</h4>
                <p>We currently support PDF documents and image files (JPG, PNG).</p>
              </div>
              <div>
                <h4 className="font-semibold">How many questions can I generate?</h4>
                <p>You can generate up to 20 questions per quiz, but you can take multiple quizzes.</p>
              </div>
              <div>
                <h4 className="font-semibold">Is my data secure?</h4>
                <p>Yes, we take data security seriously. Your uploaded documents are processed securely and not stored long-term.</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Need more help?</h3>
            <p>If you have any other questions or need assistance, please contact our support team at support@questiongenius.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-white to-sky-100 text-sky-900'}`}>
      <nav className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">QuestionGenius</h1>
        <div className="flex items-center space-x-4">
          <button
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-sky-200 text-sky-600'}`}
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            className={`px-4 py-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && (
          <motion.div
            key="welcome"
            {...pageTransition}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4"
          >
            <h2 className="text-5xl font-bold mb-6 text-center">Welcome to QuestionGenius</h2>
            <p className="text-xl mb-8 text-center max-w-2xl">
              Unlock your knowledge potential with AI-powered quizzes tailored to your documents.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 rounded-full text-xl font-semibold flex items-center transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
              onClick={() => setCurrentStep('settings')}
            >
              Get Started <ChevronRight className="ml-2" />
            </motion.button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <Upload className={`w-12 h-12 mb-4 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Start by uploading your PDF documents or images.
                </p>
              </div>
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <Brain className={`w-12 h-12 mb-4 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Our AI generates tailored questions based on your content.
                </p>
              </div>
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <Zap className={`w-12 h-12 mb-4 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} />
                <h3 className="text-xl font-semibold mb-2">Take the Quiz</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Answer questions and track your progress in real-time.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'upload' && (
          <motion.div
            key="upload"
            {...pageTransition}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]"
          >
            <div className={`p-8 rounded-lg shadow-lg max-w-2xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-3xl font-semibold mb-6">Upload Your Documents</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${darkMode ? 'border-gray-600' : 'border-sky-300'}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-sky-500'}`} />
                <p className="mb-4">Drag and drop your files here, or click to select files</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="fileInput"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="fileInput"
                  className={`px-6 py-3 rounded-full cursor-pointer transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                >
                  Select Files
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Selected files:</h4>
                  <ul>
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center">
                        <FileText className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-sky-600'}`} />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-8 px-6 py-3 rounded-full w-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                onClick={handleSubmit}
                disabled={files.length === 0 || isLoading}
              >
                {isLoading ? 'Processing...' : 'Generate Questions'}
              </motion.button>
              {isLoading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-sky-600 h-2.5 rounded-full dark:bg-sky-500"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center mt-2">{uploadProgress}% Uploaded</p>
                </div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 p-4 rounded-lg flex items-center ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'}`}
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {currentStep === 'preview' && (
          <motion.div
            key="preview"
            {...pageTransition}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12"
          >
            <div className={`p-8 rounded-lg shadow-lg max-w-3xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-3xl font-semibold mb-6">Document Preview</h3>
              <p className="mb-4">Your documents have been processed. Here's a preview of the content:</p>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6 max-h-60 overflow-y-auto`}>
			  <p className={`${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{previewText}</p>
              </div>
              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                  onClick={() => setCurrentStep('upload')}
                >
                  <ArrowLeft className="w-5 h-5 mr-2 inline" />
                  Back to Upload
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                  onClick={() => setCurrentStep('quiz')}
                >
                  Continue to Quiz
                  <ChevronRight className="w-5 h-5 ml-2 inline" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'settings' && (
          <motion.div
            key="settings"
            {...pageTransition}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12"
          >
            <div className={`p-8 rounded-lg shadow-lg max-w-3xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-3xl font-semibold mb-6">Quiz Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="numQuestions" className="block mb-2">Number of Questions:</label>
                  <input
                    type="number"
                    id="numQuestions"
                    value={quizSettings.numQuestions}
                    onChange={(e) => setQuizSettings({...quizSettings, numQuestions: parseInt(e.target.value)})}
                    className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label htmlFor="difficulty" className="block mb-2">Difficulty:</label>
                  <select
                    id="difficulty"
                    value={quizSettings.difficulty}
                    onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value})}
                    className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-8 px-6 py-3 rounded-full w-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                onClick={() => setCurrentStep('upload')}
              >
                Start Quiz
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentStep === 'quiz' && (
          <motion.div
            key="quiz"
            {...pageTransition}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12"
          >
            <div className={`p-8 rounded-lg shadow-lg max-w-3xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-3xl font-semibold mb-6">Question {currentQuestionIndex + 1} of {questions.length}</h3>
              <div className="mb-6 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-sky-600 h-2.5 rounded-full dark:bg-sky-500"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xl mb-6">{questions[currentQuestionIndex].question}</p>
              <input
                type="text"
                placeholder="Type your answer here"
                className={`w-full p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAnswerSubmit(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full w-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                onClick={() => {
                  const input = document.querySelector('input[type="text"]');
                  handleAnswerSubmit(input.value);
                  input.value = '';
                }}
              >
                Submit Answer
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentStep === 'results' && (
          <motion.div
            key="results"
            {...pageTransition}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12"
          >
            <div ref={targetRef} className={`p-8 rounded-lg shadow-lg max-w-3xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-3xl font-semibold mb-6">Quiz Results</h3>
              <p className="text-xl mb-4">You've completed the quiz! Here are your results:</p>
              <div className="space-y-4 mb-6">
                {userAnswers.map((answer, index) => (
                  <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="font-semibold mb-2">Question {index + 1}: {answer.question}</p>
                    <p>Your answer: {answer.answer}</p>
                    <p className={answer.isCorrect ? 'text-green-500' : 'text-red-500'}>
                      {answer.isCorrect ? 'Correct' : 'Incorrect'}
                    </p>
					<p>Reason: { answer.explanation }</p>
                  </div>
                ))}
              </div>
              <p className="text-xl mb-4">Your score: {calculateScore().toFixed(2)}%</p>
              <div className="mt-8 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                  onClick={() => {
                    setCurrentStep('settings');
                    setFiles([]);
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setUserAnswers([]);
                    setScore(0);
                    setQuizCompleted(false);
                  }}
                >
                  Start New Quiz
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full flex items-center transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                  onClick={() => toPDF()}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Results
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'progress' && (
          <motion.div
            key="progress"
            {...pageTransition}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12"
          >
            <div className={`p-8 rounded-lg shadow-lg max-w-3xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-3xl font-semibold mb-6">Your Progress</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xl mb-2">Quizzes Taken: {overallProgress.quizzesTaken}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-sky-600 h-2.5 rounded-full dark:bg-sky-500"
                      style={{ width: `${(overallProgress.quizzesTaken / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-xl mb-2">Average Score: {overallProgress.averageScore.toFixed(2)}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-sky-600 h-2.5 rounded-full dark:bg-sky-500"
                      style={{ width: `${overallProgress.averageScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mt-8 px-6 py-3 rounded-full w-full transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                onClick={() => setCurrentStep('upload')}
              >
                Start New Quiz
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showHelp && <HelpContent />}

      <footer className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-sky-700'}`}>
        © 2024 QuestionGenius.
      </footer>
    </div>
  );
}