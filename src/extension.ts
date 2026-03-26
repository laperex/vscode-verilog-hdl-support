// SPDX-License-Identifier: MIT
import * as vscode from 'vscode';

import LintManager from './linter/LintManager';
import * as FormatProvider from './providers/FormatProvider';
import { ExtensionManager } from './extensionManager';
import { stopAllLanguageClients } from './languageServer';
import { bootstrapLogging, disposeLogging, getExtensionLogger } from './logging';
import { FliplotCustomEditor } from './fliplot/FliplotCustomEditor';

const extensionID: string = 'mshr-h.veriloghdl';

let lintManager: LintManager;

export async function activate(context: vscode.ExtensionContext) {
  await bootstrapLogging();

  const logger = getExtensionLogger();
  logger.info("Extension activating", { extensionId: extensionID });

  const extMgr = new ExtensionManager(context, extensionID);
  if (extMgr.isVersionUpdated()) {
    extMgr.showChangelogNotification();
  }

  // Register command for manual linting
  lintManager = new LintManager();
  context.subscriptions.push(
    vscode.commands.registerCommand('verilog.lint', lintManager.runLintTool, lintManager)
  );

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      FliplotCustomEditor.viewType,
      new FliplotCustomEditor(context),
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );

  logger.info("Extension activated", { extensionId: extensionID });
}

export async function deactivate(): Promise<void> {
  const logger = getExtensionLogger();
  logger.info("Extension deactivating");
  await stopAllLanguageClients();
  await disposeLogging();
}
