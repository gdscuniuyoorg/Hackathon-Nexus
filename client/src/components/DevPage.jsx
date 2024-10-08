import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { tomorrowNightBright } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy } from "lucide-react";

const DevPage = ({ codeString, language }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code">
      <SyntaxHighlighter
        className="highlight"
        language={language}
        style={tomorrowNightBright}
      >
        {codeString}
      </SyntaxHighlighter>
      <CopyToClipboard
        text={codeString}
        onCopy={() => {
          setCopied(true);

          const timer = setTimeout(() => setCopied(false), 4000);

          return () => clearTimeout(timer);
        }}
      >
        <button>
          <Copy /> {copied ? "Copied!" : "Copy"}
        </button>
      </CopyToClipboard>
    </div>
  );
};

export default DevPage;
