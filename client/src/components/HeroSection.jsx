import { ChevronRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="hero">
      <strong>Welcome to Question Genius</strong>
      <p>
        Unlock your knowledge potential with AI-powered quizzes tailored to your
        documents.
      </p>
      <Link to="/upload">
        Get Started <ChevronRight />
      </Link>
    </section>
  );
};

export default HeroSection;
