import React from "react";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";

const Header = ({ theme, changeTheme }) => {
  return (
    <header className="header">
      <Link to="/">
        <h1>Question Genius</h1>
      </Link>
      <NavBar theme={theme} changeTheme={changeTheme} />
    </header>
  );
};

export default Header;
