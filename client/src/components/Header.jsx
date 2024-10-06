import React from "react";
import Toggle from "./Toggle";

const Header = ({ theme, changeTheme }) => {
  return (
    <header className="header">
      <h1>Question Genius</h1>
      <Toggle theme={theme} changeTheme={changeTheme} />
    </header>
  );
};

export default Header;
