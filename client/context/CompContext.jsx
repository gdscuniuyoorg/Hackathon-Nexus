import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { usePDF } from "react-to-pdf";

const CompContext = createContext();

export const CompProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState("settings");
  const [previewText, setPreview] = useState("");
  const [files, setFiles] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    numQuestions: 10,
    difficulty: "mixed",
  });
  const [overallProgress, setOverallProgress] = useState({
    quizzesTaken: 0,
    averageScore: 0,
  });
  const [showHelp, setShowHelp] = useState(false);
  const [score, setScore] = useState(0);
  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFiles([...event.dataTransfer.files]);
  };

  const { toPDF, targetRef } = usePDF({
    filename: "quiz_results.pdf",
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const params = new URLSearchParams({
      numQuestions: quizSettings.numQuestions,
      difficulty: quizSettings.difficulty,
    }).toString();

    try {
      const response = await axios.post(
        `https://hackathon-nexus.onrender.com/upload?${params}`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to upload files");
      }

      const data = response.data;

      setQuestions(data.data.questions.slice(0, quizSettings.numQuestions));
      setPreview(data.data.preview);

      setCurrentStep("preview");
    } catch (error) {
      toast.error("An error occurred while fetching data!");
      setError(
        error.message ||
          "An error occurred while processing your files. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://hackathon-nexus.onrender.com/validate-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: questions[currentQuestionIndex].question,
            correctAnswer: questions[currentQuestionIndex].correctAnswer,
            userAnswer: answer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to validate answer");
      }

      const data = await response.json();
      const isCorrect = data.result === "Correct";
      const explanation = data.explanation;

      setUserAnswers([
        ...userAnswers,
        {
          question: questions[currentQuestionIndex].question,
          answer,
          isCorrect,
          explanation,
        },
      ]);

      if (isCorrect) {
        setScore(score + 1);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true);
        setCurrentStep("results");
        updateOverallProgress();
      }
    } catch (error) {
      toast.error("An error occurred while fetching data!");
      setError(
        error.message ||
          "An error occurred while validating your answer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateOverallProgress = () => {
    const newQuizzesTaken = overallProgress.quizzesTaken + 1;
    const newAverageScore =
      (overallProgress.averageScore * overallProgress.quizzesTaken +
        calculateScore()) /
      newQuizzesTaken;
    setOverallProgress({
      quizzesTaken: newQuizzesTaken,
      averageScore: newAverageScore,
    });
  };

  const calculateScore = () => {
    return (score / questions.length) * 100;
  };

  return (
    <CompContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        handleDrop,
        handleFileChange,
        score,
        setScore,
        showHelp,
        setShowHelp,
        previewText,
        setPreview,
        files,
        setFiles,
        error,
        setError,
        isLoading,
        setIsLoading,
        questions,
        setQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        userAnswers,
        setUserAnswers,
        uploadProgress,
        setUploadProgress,
        quizCompleted,
        setQuizCompleted,
        quizSettings,
        setQuizSettings,
        overallProgress,
        setOverallProgress,
        handleSubmit,
        handleAnswerSubmit,
        updateOverallProgress,
        calculateScore,
        toPDF,
        targetRef,
      }}
    >
      {children}
    </CompContext.Provider>
  );
};

export const useCompContext = () => {
  return useContext(CompContext);
};
