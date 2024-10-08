import { Info } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="not-found">
      <Info className="info" />
      <strong>OOPS</strong>
      <p>404 | Page Not Found</p>
      <Link to="/">Go to Homepage</Link>
    </section>
  );
};

export default NotFound;
