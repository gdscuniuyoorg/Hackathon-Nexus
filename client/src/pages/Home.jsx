import React from "react";
import HeroSection from "../components/HeroSection";
import Cards from "../components/Cards";
import HowTo from "../components/HowTo";
import FAQ from "../components/Faq";
import Help from "../components/Help";

const Home = () => {
  // https://hackathon-nexus.onrender.com
  return (
    <section className="home">
      <HeroSection />
      <Cards />
      <HowTo />
      <FAQ />
      <Help />
    </section>
  );
};

export default Home;
