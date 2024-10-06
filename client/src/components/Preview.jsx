import { ArrowLeft, ChevronRight } from "lucide-react";
import React from "react";
import { useCompContext } from "../../context/CompContext";

const Preview = () => {
  const { previewText, setCurrentStep, questions } = useCompContext();
  return (
    <section className="preview">
      <strong>Document Preview</strong>
      <p>
        Your documents have been processed. Here's a preview of the content:
      </p>
      <div>{previewText}</div>
      <div>
        <button onClick={() => setCurrentStep("upload")}>
          <ArrowLeft />
          Back to Upload
        </button>
        {questions.length > 0 && (
          <button onClick={() => setCurrentStep("quiz")}>
            Continue to Quiz
            <ChevronRight />
          </button>
        )}
      </div>
    </section>
  );
};

export default Preview;
