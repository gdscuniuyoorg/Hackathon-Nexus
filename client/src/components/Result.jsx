import React from "react";
import { Download, Play } from "lucide-react";
import { useCompContext } from "../../context/CompContext";

const Result = () => {
  const {
    userAnswers,
    calculateScore,
    setCurrentQuestionIndex,
    setCurrentStep,
    setQuizCompleted,
    setScore,
    setUserAnswers,
    toPDF,
    targetRef,
  } = useCompContext();
  return (
    <section className="result">
      <div ref={targetRef}>
        <strong>Quiz Results</strong>
        <p>You've completed the quiz! Here are your results:</p>
        <div>
          {userAnswers.map((answer, index) => (
            <div key={index}>
              <p>
                Question {index + 1}: {answer.question}
              </p>
              <p>Your answer: {answer.answer}</p>
              <strong className={answer.isCorrect ? "green" : "red"}>
                {answer.isCorrect ? "Correct" : "Incorrect"}
              </strong>
              <p>Reason: {answer.explanation}</p>
            </div>
          ))}
        </div>
        <p>Your score: {calculateScore().toFixed(2)}%</p>
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => {
              setCurrentStep("settings");
              setFiles([]);
              setQuestions([]);
              setCurrentQuestionIndex(0);
              setUserAnswers([]);
              setScore(0);
              setQuizCompleted(false);
            }}
          >
            <Play /> Start New Quiz
          </button>
          <button onClick={() => toPDF()}>
            <Download />
            Export Results
          </button>
        </div>
      </div>
    </section>
  );
};

export default Result;
