import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;
let resolvePanel: vscode.WebviewPanel | null = null;

function getServerPath(context: vscode.ExtensionContext) {
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

export function activate(context: vscode.ExtensionContext) {
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
  context.subscriptions.push(vscode.commands.registerCommand("tx3.openResolvePanel", () => resolvePanelCommandHandler(context)));
  context.subscriptions.push(vscode.commands.registerCommand("tx3.openDiagramPanel", () => resolvePanelCommandHandler(context)));
  
  // Start editor subscriptions
  vscode.workspace.onDidSaveTextDocument((event) => {
    if (event.languageId !== "tx3") {
      return;
    }
    if (resolvePanel) {
      refreshResolvePanelData(event.uri);
    }
  });

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (resolvePanel) {
      const config = vscode.workspace.getConfiguration('tx3');
      resolvePanel.webview.postMessage({
        type: 'config',
        data: {
          trpServers: config.get('trpServers')
        }
      });
    }
  });
}

// TODO: We need to move the webview logic to a separate file
const resolvePanelCommandHandler = (context: vscode.ExtensionContext) => {
  const documentUri = vscode.window.activeTextEditor?.document.uri;

  resolvePanel = vscode.window.createWebviewPanel(
    'tx3-resolve-panel',
    'Tx3 Resolve',
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
				vscode.Uri.file(path.join(context.extensionPath, 'frontend', 'dist'))
			]
    }
  );

  resolvePanel.onDidDispose(
    () => resolvePanel = null,
    null,
    context.subscriptions
  );

  resolvePanel!!.webview.onDidReceiveMessage(
    message => {
      if (message.event === 'init') {
        refreshResolvePanelData(documentUri);
      } else if (message.event === 'open-settings') {
        // Open settings with custom destination
        // This destination could be empty
        vscode.commands.executeCommand('workbench.action.openSettings', message.dest);
      }
    },
    undefined,
    context.subscriptions
  );

  const config = vscode.workspace.getConfiguration('tx3');

  resolvePanel!!.webview.html = `
    <!doctype html>
    <html lang="en">
      <head>
        <title>Tx3 Resolve</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script type="module" crossorigin src="${resolvePanel!!.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'frontend', 'dist', 'bundle.js'))}"></script>
        <link rel="stylesheet" crossorigin href="${resolvePanel!!.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'frontend', 'dist', 'bundle.css'))}">
      </head>
      <body>
        <div id="root"></div>
        <script>
          const vscode = acquireVsCodeApi();
          const config = { trpServers: ${JSON.stringify(config.get('trpServers'))} };
        </script>
      </body>
    </html>
  `;
}

const refreshResolvePanelData = (_documentUri?: vscode.Uri) => {
  const documentUri = _documentUri || vscode.window.activeTextEditor?.document.uri;
  getDocumentDataFromUri(documentUri!!).then(data => {
    resolvePanel?.webview.postMessage({
      type: 'txs',
      data
    });
  });
}

// TODO: Add error handling and define an interface for the data
const getDocumentDataFromUri = async (documentUri: vscode.Uri) => {
  const txs = [] as any;
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>("vscode.executeDocumentSymbolProvider", documentUri);
  for (const symbol of symbols) {
    if (symbol.detail === "Tx") {
      const { tir, parameters } = await client.sendRequest<any>(
        "workspace/executeCommand",
        { command: "generate-tir", arguments: [documentUri.toString(), symbol.name] }
      );
      txs.push({ name: symbol.name, tir, parameters });
    }
  }
  return txs;
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
