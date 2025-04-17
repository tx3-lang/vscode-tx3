import * as vscode from "vscode";

import LanguageServerModule from "./modules/languageServer";
import WebviewModule from "./modules/webview";

export function activate(context: vscode.ExtensionContext) {
  const lspClient = LanguageServerModule.activate(context);
  WebviewModule.activate(context, lspClient);
}

export function deactivate(): Thenable<void> | undefined {
  return LanguageServerModule.deactivate();
}
