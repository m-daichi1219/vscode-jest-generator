import * as vscode from 'vscode';
import { Disposable } from 'vscode';
import { TextEncoder } from 'util';
import { createTestContent, createTestEachContent, createTestFileAbsolutePath, createTestFileName, funcRegex, getFunctionName, writeTestFile } from './format';
import * as path from 'path';

export class CodelensProvider implements vscode.CodeLensProvider {
	constructor() { }

	/**
	 * ドキュメント変更時に呼ばれる、CodeLensの場所を示すための関数
	 */
	public provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		const codeLenses: vscode.CodeLens[] = [];

		// ドキュメントの読み取り
		const text = document.getText();
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			throw new Error('No activeTextEditor found');
		}

		// 正規表現で見出しの検索
		const regex = new RegExp(funcRegex);
		let matches;
		while ((matches = regex.exec(text)) !== null) {
			// 見出しが見つかった行を抽出し、
			// その範囲をレンジとして切り出す
			const line = document.lineAt(document.positionAt(matches.index).line);
			const indexOf = line.text.indexOf(matches[0]);
			const position = new vscode.Position(line.lineNumber, indexOf);

			const functionName = getFunctionName(line);

			const range = document.getWordRangeAtPosition(
				position,
				new RegExp(funcRegex)
			);
			if (range) {
				// この範囲に対するCodeLensを作成する
				codeLenses.push(
					new vscode.CodeLens(range, {
						title: "test",
						tooltip: "test",
						command: 'vscode-jest-generator.test',
						arguments: [document.fileName, functionName]
					}),
					new vscode.CodeLens(range, {
						title: "test.each",
						tooltip: "test text",
						command: 'vscode-jest-generator.test-each',
						arguments: [document.fileName, functionName]
					}),
				);
			}
		}
		return codeLenses;
	}

	/**
	 * ドキュメント中にCodeLensが表示されたときに呼ばれる、CodeLensの詳細を示すための関数
	 */
	public resolveCodeLens(
		codeLens: vscode.CodeLens,
		token: vscode.CancellationToken
	) {
		return codeLens;
	}
}
let disposables: Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
	const codelensProvider = new CodelensProvider();

	let disposableJS = vscode.languages.registerCodeLensProvider(
		{ language: 'javascript' },
		codelensProvider
	);
	let disposableTS = vscode.languages.registerCodeLensProvider(
		{ language: 'typescript' },
		codelensProvider
	);

	disposables.push(disposableJS);
	disposables.push(disposableTS);

	/**
	 * test
	 */
	vscode.commands.registerCommand("vscode-jest-generator.test", (activeFileAbsolutePath: string, funcName: string) => {
		vscode.workspace.workspaceFolders?.map(async (item) => {
			const projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			const activeEditor = vscode.window.activeTextEditor;
			if (projectRoot === undefined) return;
			if (!activeEditor) {
				vscode.window.showErrorMessage('No active editor found');
				return;
			}


			const activeFilePath = activeFileAbsolutePath.replace(projectRoot, '');
			const activeFileParse = path.parse(activeFilePath);

			const testFileName = createTestFileName(activeFileParse.base, activeFileParse.ext);
			const testFileAbsolutePath = createTestFileAbsolutePath(projectRoot, activeFileAbsolutePath, testFileName)
			const contents = createTestContent(funcName, testFileAbsolutePath, activeFileAbsolutePath, activeFileParse.ext);

			await writeTestFile(testFileAbsolutePath, contents);
		});
	});

	/**
	 * test.each
	 */
	vscode.commands.registerCommand("vscode-jest-generator.test-each", (activeFileAbsolutePath: string, funcName: string) => {
		vscode.workspace.workspaceFolders?.map(async (item) => {
			const projectRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			const activeEditor = vscode.window.activeTextEditor;
			if (projectRoot === undefined) return;
			if (!activeEditor) {
				vscode.window.showErrorMessage('No active editor found');
				return;
			}


			const activeFilePath = activeFileAbsolutePath.replace(projectRoot, '');
			const activeFileParse = path.parse(activeFilePath);

			const testFileName = createTestFileName(activeFileParse.base, activeFileParse.ext);
			const testFileAbsolutePath = createTestFileAbsolutePath(projectRoot, activeFileAbsolutePath, testFileName)
			const contents = createTestEachContent(funcName, testFileAbsolutePath, activeFileAbsolutePath, activeFileParse.ext);

			await writeTestFile(testFileAbsolutePath, contents);
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
