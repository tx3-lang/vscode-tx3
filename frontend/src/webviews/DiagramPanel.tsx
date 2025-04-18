import React, { useEffect, useState } from "react";

import Title from "../components/Title";

import type { Program, TxDef } from "../types/ast";

type PartyType = 'unknown' | 'party' | 'policy';

interface Party {
  name: string;
  type: PartyType;
}

interface Parameter {
  name: string;
  party?: string;
}

const getInputParties = (ast: Program, tx: TxDef): Party[] => {
  const parties: Set<string> = new Set();
  for (const input of tx.inputs) {
    for (const field of input.fields) {
      if ('From' in field) {
        if ('Identifier' in field.From) {
          parties.add(field.From.Identifier.value);
        }
      }
    }
  }
  return Array.from(parties).map(name => ({
    name,
    type: inferPartyType(ast, name)
  }));
}

const getOutputParties = (ast: Program, tx: TxDef): Party[] => {
  const parties: Set<string> = new Set();
  for (const output of tx.outputs) {
    for (const field of output.fields) {
      if ('To' in field) {
        if ('Identifier' in field.To) {
          parties.add(field.To.Identifier.value);
        }
      }
    }
  }
  return Array.from(parties).map(name => ({
    name,
    type: inferPartyType(ast, name)
  }));
}

const getInputs = (tx: TxDef): Parameter[] => {
  const inputs: Parameter[] = [];
  for (const txInput of tx.inputs) {
    const input: Parameter = { name: txInput.name};
    for (const field of txInput.fields) {
      if ('From' in field) {
        if ('Identifier' in field.From) {
          input.party = field.From.Identifier.value;
        }
      }
    }
    inputs.push(input);
  }
  return inputs;
}

const getOutputs = (tx: TxDef): Parameter[] => {
  const outputs: Parameter[] = [];
  for (const [index, txOutput] of tx.outputs.entries()) {
    const output: Parameter = { name: txOutput.name || `output ${index+1}` };
    for (const field of txOutput.fields) {
      if ('To' in field) {
        if ('Identifier' in field.To) {
          output.party = field.To.Identifier.value;
        }
      }
    }
    outputs.push(output);
  }
  return outputs;
}

const inferPartyType = (ast: Program, name: string): PartyType => {
  for (const party of ast.parties) {
    if (party.name === name) {
      return 'party';
    }
  }
  for (const policy of ast.policies) {
    if (policy.name === name) {
      return 'policy';
    }
  }
  return 'unknown';
}

interface PartyProps {
  party: Party;
  x: number|string;
  y: number|string;
}

const getIconUrl = (type: PartyType): string => (
  new URL(`../images/${type === 'unknown' ? 'party' : type}.svg`, import.meta.url).href
);

const Party: React.FC<PartyProps> = (props: PartyProps) => (
  <svg
    x={props.x} y={props.y}
    width={UNIT} height={UNIT}
    viewBox={`0 0 ${UNIT} ${UNIT}`}
  >
    <image
      x="25%" y="15%"
      width="50%" height="60%"
      href={getIconUrl(props.party.type)}
    />
    <text
      x="50%" y="85%" textAnchor="middle"
      style={{ fontSize: '14%', fontFamily: 'monospace', fill: '#fff' }}
    >
      {props.party.name}
    </text>
  </svg>
);

interface TxProps {
  tx: TxDef;
  x: number|string;
  y: number|string;
}

const Tx: React.FC<TxProps> = (props: TxProps) => (
  <g transform={`translate(-${UNIT})`}>
    <svg
      x={props.x} y={props.y}
      width={UNIT*2} height={UNIT*4}
      viewBox={`0 0 ${UNIT} ${UNIT*2}`}
    >
      <rect
        width="100%" height="100%" rx={UNIT/10} ry={UNIT/10}
        fillOpacity="0" stroke="white" strokeWidth="0.25"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: '10%', fontFamily: 'monospace', fill: '#fff' }}
      >
        {props.tx.name}
      </text>
    </svg>
  </g>
);

interface ParameterProps {
  parameter: Parameter;
  x: number|string;
  y: number|string;
}

const Parameter: React.FC<ParameterProps> = (props: ParameterProps) => (
  <g transform={`translate(-${UNIT},${UNIT/2})`}>
    <svg
      x={props.x} y={props.y}
      width={UNIT*2} height={UNIT/2}
      viewBox={`0 0 ${UNIT} ${UNIT/4}`}
    >
      <text
        x="50%" y="10%"
        textAnchor="middle"
        dominantBaseline="hanging"
        style={{ fontSize: '10%', fontFamily: 'monospace', fill: '#fff' }}
      >
        {props.parameter.name}
      </text>
      <line
        x1="20%" y1="90%" x2="80%" y2="90%"
        stroke="#fff" strokeWidth="0.25"
      />
      <line
        x1="70%" y1="80%" x2="80%" y2="90%"
        stroke="#fff" strokeWidth="0.25"
      />
      <line
        x1="70%" y1="100%" x2="80%" y2="90%"
        stroke="#fff" strokeWidth="0.25"
      />
    </svg>
  </g>
);

interface TxDiagramProps {
  ast: Program;
  tx: TxDef;
}

const TxDiagram: React.FC<TxDiagramProps> = (props: TxDiagramProps) => {
  const inputParties = getInputParties(props.ast, props.tx);
  const outputParties = getOutputParties(props.ast, props.tx);
  const inputs = getInputs(props.tx);
  const outputs = getOutputs(props.tx);

  const inputConnections: number[][] = [];
  for (const [inputIndex, input] of inputs.entries()) {
    if (input.party) {
      const partyIndex = inputParties.findIndex(p => p.name === input.party);
      if (partyIndex !== -1) {
        inputConnections.push([partyIndex, inputIndex]);
      }
    }
  }

  const outputConnections: number[][] = [];
  for (const [outputIndex, output] of outputs.entries()) {
    if (output.party) {
      const partyIndex = outputParties.findIndex(p => p.name === output.party);
      if (partyIndex !== -1) {
        outputConnections.push([partyIndex, outputIndex]);
      }
    }
  }

  return (
    <svg width="100%" viewBox={`0 0 ${CANVA_WIDTH} ${CANVA_HEIGHT}`} className="my-16">
      <Tx x={CANVA_WIDTH/2} y="0" tx={props.tx} />
      {inputParties.map((party, index) =>
        <Party
          x="0"
          y={UNIT*index}
          party={party}
          key={index}
        />
      )}
      {outputParties.map((party, index) =>
        <Party
          x={CANVA_WIDTH-UNIT}
          y={UNIT*index}
          party={party}
          key={index}
        />
      )}
      <g transform={`translate(${UNIT/2})`}>
        {inputs.map((input, index) =>
          <Parameter
            x={CANVA_WIDTH/4}
            y={UNIT*index}
            parameter={input}
            key={index}
          />
        )}
      </g>
      <g transform={`translate(-${UNIT/2})`}>
        {outputs.map((output, index) =>
          <Parameter
            x={(CANVA_WIDTH/2)+(CANVA_WIDTH/4)}
            y={UNIT*index}
            parameter={output}
            key={index}
          />
        )}
      </g>
      {inputConnections.map(([partyIndex, inputIndex], index) =>
        <line
          key={index}
          x1={UNIT} y1={(UNIT*partyIndex)+(UNIT/2)}
          x2={(CANVA_WIDTH/4)-(UNIT/8)} y2={UNIT*(inputIndex+1)-(UNIT/16)}
          stroke="#fff" strokeWidth="0.4" strokeDasharray="1,1" strokeOpacity="0.5"
        />
      )}
      {outputConnections.map(([partyIndex, outputIndex], index) =>
        <line
          key={index}
          x1={(CANVA_WIDTH/2)+(CANVA_WIDTH/4)+(UNIT/8)} y1={UNIT*(outputIndex+1)-(UNIT/16)}
          x2={CANVA_WIDTH-UNIT} y2={(UNIT*partyIndex)+(UNIT/2)}
          stroke="#fff" strokeWidth="0.4" strokeDasharray="1,1" strokeOpacity="0.5"
        />
      )}
    </svg>
  );
}

const UNIT = 16;
const CANVA_WIDTH = UNIT * 10;
const CANVA_HEIGHT = UNIT * 4;

const DiagramPanel: React.FC = () => {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [ast, setAst] = useState<Program|null>(null);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    vscode.postMessage({ event: 'init' });
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMessage = (event: MessageEvent<AppEvent>) => {
    if (event.data.type === 'document-data') {
      setTxs(event.data.data.txs);
      setAst(event.data.data.ast);
      console.log(event.data.data.ast as Program);
    }
  };

  return (
    <div className="root">
      <h3 className="panel-title">Tx3 Diagram</h3>
      {ast !== null && ast.txs.map((tx: TxDef, index: number) =>
        <div key={index}>
          <Title>Tx {tx.name}</Title>
          <TxDiagram ast={ast} tx={tx} />
        </div>
      )}
    </div>
  );
}

export default DiagramPanel;