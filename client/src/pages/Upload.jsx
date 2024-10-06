import React from "react";
import Settings from "../components/Settings";
import { useCompContext } from "../../context/CompContext";
import UploadFile from "../components/UploadFile";
import Preview from "../components/Preview";
import Quiz from "../components/Quiz";
import Result from "../components/Result";

const Upload = () => {
  const { currentStep } = useCompContext();
  return (
    <section>
      {currentStep === "settings" && <Settings />}
      {currentStep == "upload" && <UploadFile />}
      {currentStep == "preview" && <Preview />}
      {currentStep == "quiz" && <Quiz />}
      {currentStep == "results" && <Result />}
    </section>
  );
};

export default Upload;
