import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy } from "lucide-react";

const DevPage = () => {
  const codeString = `console.log("Hello, world!");`;
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{ position: "relative", marginBottom: "20px" }}
      className="code"
    >
      <CopyToClipboard text={codeString} onCopy={() => setCopied(true)}>
        <button>
          <Copy /> {copied ? "Copied!" : "Copy"}
        </button>
      </CopyToClipboard>
      <SyntaxHighlighter
        className="highlight"
        language="javascript"
        style={dracula}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default DevPage;
