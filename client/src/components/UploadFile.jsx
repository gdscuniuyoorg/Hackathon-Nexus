import React from "react";
import { useCompContext } from "../../context/CompContext";
import { AlertCircle, FileText, Upload } from "lucide-react";

const UploadFile = () => {
  const {
    handleDrop,
    handleFileChange,
    handleSubmit,
    files,
    isLoading,
    error,
    uploadProgress,
  } = useCompContext();
  return (
    <section className="upload">
      <strong>Upload Your Documents</strong>
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <Upload />
        <p>Drag and drop your files here, or click to select files</p>
        <input
          type="file"
          multiple
          className="hidden"
          id="fileInput"
          onChange={handleFileChange}
          style={{
            display: "none",
          }}
        />
        <label htmlFor="fileInput">Select Files</label>
      </div>
      <section className="text-cont">
        <label htmlFor="text-prompt">Add additional details</label>
        <textarea
          name="text-prompt"
          id="text-prompt"
          placeholder="Add additional context here"
        ></textarea>
      </section>
      {files.length > 0 && (
        <div>
          <strong>Selected files:</strong>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <FileText />
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleSubmit} disabled={files.length === 0 || isLoading}>
        {isLoading ? "Processing..." : "Generate Questions"}
      </button>
      {isLoading && (
        <div>
          <div className="progress">
            <div style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p>{uploadProgress}% Uploaded</p>
        </div>
      )}
      {error && (
        <section className="error">
          <AlertCircle />
          {error}
        </section>
      )}
    </section>
  );
};

export default UploadFile;
