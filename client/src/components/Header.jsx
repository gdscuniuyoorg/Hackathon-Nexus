import React from "react";
import NavBar from "./NavBar";

const Header = ({ theme, changeTheme }) => {
  return (
    <header className="header">
      <h1>Question Genius</h1>
      <NavBar theme={theme} changeTheme={changeTheme} />
    </header>
  );
};

export default Header;
