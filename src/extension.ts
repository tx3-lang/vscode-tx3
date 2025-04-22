import { existsSync } from "fs";
import * as vscode from "vscode";

import LanguageServerModule from "./modules/languageServer";
import WebviewModule from "./modules/webview";

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('tx3');
  
  const lspPath = (config.get('lspPath') as string).replace("~", process.env.HOME!);
  if (!existsSync(lspPath)) {
    vscode.window.showErrorMessage(`Tx3 Language Server not found at ${lspPath}`);
    return;
  }

  const lspClient = LanguageServerModule.activate(context, lspPath);
  WebviewModule.activate(context, lspClient);
}

export function deactivate(): Thenable<void> | undefined {
  return LanguageServerModule.deactivate();
}
