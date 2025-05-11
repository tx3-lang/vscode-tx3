declare type VSCode = {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

declare const vscode: VSCode;

declare type TrpServer = {
  name: string;
  url: string;
  headers?: Record<string, string>;
};

declare type Config = {
  trpServers: TrpServer[];
};

declare const config: Config;

declare type Tx = {
  name: string;
  parameters: Record<string, string>;
  tir: string;
  version: string;
};

declare type DocumentData = {
  txs: Tx[];
  ast: any;
};

declare interface AppEvent {
  type: "document-data" | "config";
  data: any;
}

declare interface DataAppEvent extends AppEvent {
  type: "document-data";
  data: DocumentData;
}

declare interface TrpServersAppEvent extends AppEvent {
  type: "config";
  data: Config;
}

declare type AppEvent = DataAppEvent | TrpServersAppEvent;

declare const webview: "DIAGRAM-PANEL" | "RESOLVE-PANEL";
