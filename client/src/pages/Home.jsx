import React from "react";
import HeroSection from "../components/HeroSection";
import Cards from "../components/Cards";
import HowTo from "../components/HowTo";
import Help from "../components/Help";
import FaqCont from "../components/FaqCont";

const Home = () => {
  // https://hackathon-nexus.onrender.com
  return (
    <section className="home">
      <HeroSection />
      <Cards />
      <HowTo />
      <FaqCont />
      <Help />
    </section>
  );
};

export default Home;
