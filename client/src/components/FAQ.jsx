import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAnswer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="faq-item">
      <div className="faq-question" onClick={toggleAnswer}>
        <h3>{question}</h3>
        {isOpen ? (
          <ChevronDown className="icon" />
        ) : (
          <ChevronUp className="icon" />
        )}
      </div>
      <div className={`faq-answer ${isOpen ? "show" : "hide"}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "What file types are supported?",
      answer: "We currently support PDF documents and image files (JPG, PNG).",
    },
    {
      question: "How many questions can I generate?",
      answer:
        "You can generate up to 20 questions per quiz, but you can take multiple quizzes",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security seriously. Your uploaded documents are processed securely and not stored long-term",
    },
  ];

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions (FAQ) </h1>
      {faqs.map((faq, index) => (
        <FAQItem key={index} {...faq} />
      ))}
    </div>
  );
};

export default FAQ;
