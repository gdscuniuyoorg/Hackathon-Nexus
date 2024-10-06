import { Sun, Moon } from "lucide-react";
import React from "react";

const Toggle = ({ theme, changeTheme }) => {
  return (
    <div className="toggle">
      {theme === "theme-dark" && (
        <Sun color="#ffffff" onClick={() => changeTheme()} />
      )}
      {theme === "theme-light" && (
        <Moon color="#19202d" onClick={() => changeTheme()} />
      )}
    </div>
  );
};

export default Toggle;
