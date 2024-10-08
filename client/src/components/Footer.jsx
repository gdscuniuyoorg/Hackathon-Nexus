import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <p>&copy; 2024 - {currentYear} Question Genius, All Rights Reserved</p>
      <span>Created By Team Nexus</span>
    </footer>
  );
};

export default Footer;
