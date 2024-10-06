import { Brain, Upload, Zap } from "lucide-react";
import React from "react";

const Cards = () => {
  return (
    <section className="cards">
      <div>
        <div className="icon">
          <Upload />
        </div>
        <strong>Upload Documents</strong>
        <p>Start by uploading your PDF documents or images.</p>
      </div>
      <div>
        <div className="icon">
          <Brain />
        </div>
        <strong>AI Analysis</strong>
        <p>Our AI generates tailored questions based on your content.</p>
      </div>
      <div>
        <div className="icon">
          <Zap />
        </div>
        <strong>Take the Quiz</strong>
        <p>Answer questions and track your progress in real-time.</p>
      </div>
    </section>
  );
};

export default Cards;
