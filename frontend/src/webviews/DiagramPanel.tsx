import React, { useEffect, useState } from "react";
import parse from "html-react-parser";

import Title from "../components/Title";

const DiagramPanel: React.FC = () => {
  type DiagramItem = { tx_name: string; svg: string };
  const [diagram, setDiagram] = useState<DiagramItem[] | null>(null);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    vscode.postMessage({ event: "init" });
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleMessage = (event: MessageEvent<AppEvent>) => {
    if (event.data.type === "document-data") {
      setDiagram(event.data.data.diagram);
      console.log(event.data.data.diagram);
    }
  };

  return (
    <div className="root">
      <h3 className="panel-title">Tx3 Diagram</h3>
      {diagram?.map(({ tx_name, svg }) => {
        return (
          <div key={tx_name}>
            <Title>Tx {tx_name}</Title>
            {parse(svg)}
          </div>
        );
      })}
    </div>
  );
};

export default DiagramPanel;
