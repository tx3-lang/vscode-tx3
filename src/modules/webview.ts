import * as path from "path";
import * as vscode from "vscode";

import { LanguageClient } from "vscode-languageclient/node";

let resolvePanel: vscode.WebviewPanel | null = null;
let diagramPanel: vscode.WebviewPanel | null = null;

const activate = (
  context: vscode.ExtensionContext,
  lspClient: LanguageClient
) => {
  // Start commands subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand("tx3.openResolvePanel", () =>
      openResolvePanelCommandHandler(context, lspClient)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("tx3.openDiagramPanel", () =>
      openDiagramPanelCommandHandler(context, lspClient)
    )
  );

  // Start editor subscriptions
  vscode.workspace.onDidSaveTextDocument((event) => {
    if (event.languageId !== "tx3") {
      return;
    }
    refreshPanelData(lspClient, resolvePanel, "resolve-panel", event.uri);
    refreshPanelData(lspClient, diagramPanel, "diagram-panel", event.uri);
  });

  // Start config subscriptions
  vscode.workspace.onDidChangeConfiguration((event) => {
    onDidChangeConfiguration(resolvePanel);
    onDidChangeConfiguration(diagramPanel);
  });
};

const openResolvePanelCommandHandler = (
  context: vscode.ExtensionContext,
  lspClient: LanguageClient
) => {
  resolvePanel = openPanelCommandHandler(
    context,
    lspClient,
    "resolve-panel",
    "Tx3 Resolve"
  );
  resolvePanel.onDidDispose(
    () => (resolvePanel = null),
    null,
    context.subscriptions
  );
};

const openDiagramPanelCommandHandler = (
  context: vscode.ExtensionContext,
  lspClient: LanguageClient
) => {
  diagramPanel = openPanelCommandHandler(
    context,
    lspClient,
    "diagram-panel",
    "Tx3 Diagram"
  );
  diagramPanel.onDidDispose(
    () => (resolvePanel = null),
    null,
    context.subscriptions
  );
};

const openPanelCommandHandler = (
  context: vscode.ExtensionContext,
  lspClient: LanguageClient,
  type: string,
  title: string
): vscode.WebviewPanel => {
  const documentUri = vscode.window.activeTextEditor?.document.uri;

  const panel = vscode.window.createWebviewPanel(
    type,
    title,
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, "frontend", "dist")),
      ],
    }
  );

  panel.webview.onDidReceiveMessage(
    (message) => {
      if (message.event === "init") {
        refreshPanelData(lspClient, panel, type, documentUri);
      } else if (message.event === "open-settings") {
        // Open settings with custom destination
        // This destination could be empty
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          message.dest
        );
      }
    },
    undefined,
    context.subscriptions
  );

  const config = vscode.workspace.getConfiguration("tx3");

  panel.webview.html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script type="module" crossorigin src="${panel.webview.asWebviewUri(
          vscode.Uri.joinPath(
            context.extensionUri,
            "frontend",
            "dist",
            "bundle.js"
          )
        )}"></script>
        <link rel="stylesheet" crossorigin href="${panel.webview.asWebviewUri(
          vscode.Uri.joinPath(
            context.extensionUri,
            "frontend",
            "dist",
            "bundle.css"
          )
        )}">
      </head>
      <body>
        <div id="root"></div>
        <script>
          const vscode = acquireVsCodeApi();
          const webview = "${type.toUpperCase()}";
          const config = { trpServers: ${JSON.stringify(
            config.get("trpServers")
          )} };
        </script>
      </body>
    </html>
  `;

  return panel;
};

const refreshPanelData = (
  lspClient: LanguageClient,
  panel: vscode.WebviewPanel | null,
  type: string,
  _documentUri?: vscode.Uri
) => {
  if (panel !== null) {
    const documentUri =
      _documentUri || vscode.window.activeTextEditor?.document.uri;
    if (documentUri) {
      const features: string[] = [];
      if (type === "resolve-panel") {
        features.push("txs");
      } else if (type === "diagram-panel") {
        features.push("txs", "ast");
      }
      getDocumentDataFromUri(lspClient, documentUri, features).then(
        (documentData) => {
          panel.webview.postMessage({
            type: "document-data",
            data: documentData,
          });
        }
      );
    }
  }
};

const getDocumentDataFromUri = async (
  lspClient: LanguageClient,
  documentUri: vscode.Uri,
  features: string[]
) => {
  const data = {} as any;

  if (features.includes("txs")) {
    data.txs = [];
    const symbols = await vscode.commands.executeCommand<
      vscode.DocumentSymbol[]
    >("vscode.executeDocumentSymbolProvider", documentUri);
    for (const symbol of symbols) {
      if (symbol.detail === "Tx") {
        const { tir, version, parameters } = await lspClient.sendRequest<any>(
          "workspace/executeCommand",
          {
            command: "generate-tir",
            arguments: [documentUri.toString(), symbol.name],
          }
        );
        data.txs.push({ name: symbol.name, tir, version, parameters });
      }
    }
  }

  if (features.includes("ast")) {
    const { ast } = await lspClient.sendRequest<any>(
      "workspace/executeCommand",
      { command: "generate-ast", arguments: [documentUri.toString()] }
    );
    data.ast = ast;
  }

  return data;
};

const onDidChangeConfiguration = (panel: vscode.WebviewPanel | null) => {
  if (panel !== null) {
    const config = vscode.workspace.getConfiguration("tx3");
    panel.webview.postMessage({
      type: "config",
      data: {
        trpServers: config.get("trpServers"),
      },
    });
  }
};

export default { activate };
