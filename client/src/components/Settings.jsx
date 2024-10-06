import React from "react";
import { useCompContext } from "../../context/CompContext";
import { ChevronDown } from "lucide-react";

const Settings = () => {
  const { quizSettings, setCurrentStep, setQuizSettings } = useCompContext();
  return (
    <section className="settings">
      <strong>Quiz Settings</strong>
      <div>
        <label htmlFor="numQuestions">Number of Questions:</label>
        <input
          type="number"
          id="numQuestions"
          value={quizSettings.numQuestions}
          onChange={(e) =>
            setQuizSettings({
              ...quizSettings,
              numQuestions: parseInt(e.target.value),
            })
          }
          min="1"
          max="20"
        />
      </div>
      <div>
        <label htmlFor="difficulty">Difficulty:</label>
        <div>
          <select
            id="difficulty"
            value={quizSettings.difficulty}
            onChange={(e) =>
              setQuizSettings({
                ...quizSettings,
                difficulty: e.target.value,
              })
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="mixed">Mixed</option>
          </select>
          <ChevronDown color="#6e8098" className="chevron-down" />
        </div>
      </div>
      <button onClick={() => setCurrentStep("upload")}>Start Quiz</button>
    </section>
  );
};

export default Settings;
