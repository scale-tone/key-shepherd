import * as vscode from 'vscode';

import { ControlTypeEnum } from './KeyMetadataHelpers';
import { KeyShepherd } from './KeyShepherd';

var shepherd: KeyShepherd;

export async function activate(context: vscode.ExtensionContext) {

    shepherd = await KeyShepherd.create(context);

    await shepherd.stashPendingFolders();
    await shepherd.maskSecretsInThisFile(false);

    context.subscriptions.push(

        vscode.commands.registerCommand('key-shepherd-vscode.changeStorageType', () => shepherd.changeStorageType(context)),

        vscode.window.registerTreeDataProvider('key-shepherd-tree-view', shepherd.treeView),

        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.superviseSecret', () => shepherd.controlSecret(ControlTypeEnum.Supervised)),
        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.controlSecret', () => shepherd.controlSecret(ControlTypeEnum.Managed)),

        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.insertSupervisedSecret', () => shepherd.insertSecret(ControlTypeEnum.Supervised)),
        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.insertManagedSecret', () => shepherd.insertSecret(ControlTypeEnum.Managed)),

        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.maskSecrets', () => shepherd.maskSecretsInThisFile(true)),
        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.unmaskSecrets', () => shepherd.unmaskSecretsInThisFile()),

        vscode.commands.registerCommand('key-shepherd-vscode.maskSecrets', () => shepherd.maskSecretsInThisFile(true)),
        vscode.commands.registerCommand('key-shepherd-vscode.unmaskSecrets', () => shepherd.unmaskSecretsInThisFile()),

        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.stashSecrets', () => shepherd.stashUnstashSecretsInThisFile(true)),
        vscode.commands.registerCommand('key-shepherd-vscode.editor-context.unstashSecrets', () => shepherd.stashUnstashSecretsInThisFile(false)),

        vscode.commands.registerCommand('key-shepherd-vscode.stashSecrets', () => shepherd.stashUnstashSecretsInThisFile(true)),
        vscode.commands.registerCommand('key-shepherd-vscode.unstashSecrets', () => shepherd.stashUnstashSecretsInThisFile(false)),

        vscode.commands.registerCommand('key-shepherd-vscode.stashAllWorkspaceSecrets', () => shepherd.stashUnstashAllSecretsInThisProject(true)),
        vscode.commands.registerCommand('key-shepherd-vscode.unstashAllWorkspaceSecrets', () => shepherd.stashUnstashAllSecretsInThisProject(false)),

        vscode.commands.registerCommand('key-shepherd-vscode.view-context.refresh', () => shepherd.treeView.refresh()),
        vscode.commands.registerCommand('key-shepherd-vscode.view-context.gotoSecret', (item) => shepherd.gotoSecret(item)),
        vscode.commands.registerCommand('key-shepherd-vscode.view-context.forgetSecrets', (item) => shepherd.forgetSecrets(item)),
        vscode.commands.registerCommand('key-shepherd-vscode.view-context.forgetSecret', (item) => shepherd.forgetSecrets(item)),
        vscode.commands.registerCommand('key-shepherd-vscode.view-context.stashSecrets', (item) => shepherd.stashUnstashSecretsInFolder(item, true)),
        vscode.commands.registerCommand('key-shepherd-vscode.view-context.unstashSecrets', (item) => shepherd.stashUnstashSecretsInFolder(item, false)),

        vscode.window.onDidChangeActiveTextEditor((editor) => shepherd.maskSecretsInThisFile(true)),
 
        vscode.workspace.onDidSaveTextDocument((doc) => shepherd.maskSecretsInThisFile(true)),

        // Too powerful
//        vscode.workspace.onDidChangeTextDocument(async (evt) => {
//        }),
        
    );

    const config = vscode.workspace.getConfiguration('key-shepherd');
    const autoUnstashMode = config.get("autoUnstashMode");

    if (autoUnstashMode === "When a workspace is opened") {
        
        await shepherd.stashUnstashAllSecretsInThisProject(false);
    }
}

// this method is called when your extension is deactivated
export async function deactivate() {

    const config = vscode.workspace.getConfiguration('key-shepherd');
    const autoStashMode = config.get("autoStashMode");

    if (autoStashMode === "When a workspace is closed") {
        
        await shepherd.stashUnstashAllSecretsInThisProject(true);

    }

    shepherd.dispose();
}
