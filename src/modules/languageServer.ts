import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

const getServerPath = (context: vscode.ExtensionContext): { command: string; args: string[]; } => {
  if (context.extensionMode === vscode.ExtensionMode.Development) {
    return {
      command: "cargo",
      args: ["run", "--bin", "tx3-lsp", "--"],
    };
  }

  return {
    command: context.asAbsolutePath(`tx3-lsp-${process.platform}-${process.arch}`),
    args: [],
  };
}

const activate = (context: vscode.ExtensionContext): LanguageClient => {
  const serverConfig = getServerPath(context);

  // The server options. We launch the Rust binary directly
  const serverOptions: ServerOptions = {
    run: {
      command: serverConfig.command,
      args: serverConfig.args,
      transport: TransportKind.stdio,
    },
    debug: {
      command: serverConfig.command,
      args: serverConfig.args, // TODO: Add --debug
      transport: TransportKind.stdio,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for Tx3 documents
    documentSelector: [{ scheme: "file", language: "tx3" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.tx3"),
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "tx3",
    "Tx3 Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  // Start commands subscriptions
  context.subscriptions.push(vscode.commands.registerCommand("tx3.startServer", () => client.start()));

  return client;
}

const deactivate = (): Thenable<void> | undefined => {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

export default { activate, deactivate }