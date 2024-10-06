import React, { useState } from "react";
import { Link } from "react-router-dom";
import Toggle from "./Toggle";
import { MenuIcon, X } from "lucide-react";

const NavBar = ({ theme, changeTheme }) => {
  const [showBar, setShowBar] = useState(false);
  return (
    <section className="left">
      <nav className={showBar ? "" : "none"}>
        <Link to={"/"} onClick={() => setShowBar(false)}>
          Home
        </Link>
        <Link to={"/upload"} onClick={() => setShowBar(false)}>
          Upload
        </Link>
        <Link to={"/docs"} target="_blank" onClick={() => setShowBar(false)}>
          Docs
        </Link>
      </nav>
      <Toggle theme={theme} changeTheme={changeTheme} />
      {!showBar && (
        <MenuIcon onClick={() => setShowBar(true)} className="bar-icon" />
      )}
      {showBar && <X onClick={() => setShowBar(false)} className="bar-icon" />}
    </section>
  );
};

export default NavBar;
