import React from "react";
import { useCompContext } from "../../context/CompContext";

const Quiz = () => {
  const { currentQuestionIndex, questions, handleAnswerSubmit } =
    useCompContext();
  return (
    <section className="quiz">
      <strong>
        Question {currentQuestionIndex + 1} of {questions.length}
      </strong>
      <div className="progress">
        <div
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>
      <div>
        <p>{questions[currentQuestionIndex].question}</p>
        <input
          type="text"
          placeholder="Type your answer here"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleAnswerSubmit(e.target.value);
              e.target.value = "";
            }
          }}
        />
        <button
          onClick={() => {
            const input = document.querySelector('input[type="text"]');
            handleAnswerSubmit(input.value);
            input.value = "";
          }}
        >
          Submit Answer
        </button>
      </div>
    </section>
  );
};

export default Quiz;
