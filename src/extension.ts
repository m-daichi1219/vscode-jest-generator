import * as vscode from 'vscode';
import { Disposable } from 'vscode';
import { TextEncoder } from 'util';
import { testEachFormat, testFormat } from './format';

const constRegex = /export const/g;

export class CodelensProvider implements vscode.CodeLensProvider {
	constructor() { }

	/**
	 * ドキュメント変更時に呼ばれる、CodeLensの場所を示すための関数
	 */
	public provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		const codeLenses = [];

		// ドキュメントの読み取り
		const text = document.getText();

		// 正規表現で、見出しを探す
		const regex = new RegExp(constRegex);
		let matches;
		while ((matches = regex.exec(text)) !== null) {
			// 見出しが見つかった行を抽出し、
			// その範囲をレンジとして切り出す
			const line = document.lineAt(document.positionAt(matches.index).line);
			const indexOf = line.text.indexOf(matches[0]);
			const position = new vscode.Position(line.lineNumber, indexOf);
			const range = document.getWordRangeAtPosition(
				position,
				new RegExp(constRegex)
			);
			if (range) {
				// この範囲に対するCodeLensを作成する
				codeLenses.push(
					new vscode.CodeLens(range, {
						title: "test",
						tooltip: "test",
						command: 'vscode-jest-generator.test',
						arguments: [document.fileName]
					}),
					new vscode.CodeLens(range, {
						title: "test.each",
						tooltip: "test text",
						command: 'vscode-jest-generator.test-each',
						arguments: [document.fileName]
					}),
				);
			}
		}
		console.log('codeLenses', codeLenses);
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
	vscode.commands.registerCommand("vscode-jest-generator.test", (fileName: string) => {
		vscode.workspace.workspaceFolders?.map(async (item) => {
			const targetFilePathAry = fileName.split(item.uri.fsPath)[1].split("\\");
			const testFileName = targetFilePathAry.pop()?.replace('.', '.spec.');
			const testFilePath = item.uri.fsPath + '\\tests\\' + targetFilePathAry.filter((path, idx) => {
				if (idx > 1) { return true; }
				return false;
			}).join('\\') + '\\' + testFileName;

			try {
				// exists file
				const existsBuffer = await vscode.workspace.fs.readFile(vscode.Uri.file(testFilePath));
				const existsText = Buffer.from(Uint8Array.from(existsBuffer)).toString();

				await vscode.workspace.fs.writeFile(vscode.Uri.file(testFilePath), new TextEncoder().encode(existsText + '\n' + testFormat));
			} catch {
				// not exists file
				await vscode.workspace.fs.writeFile(vscode.Uri.file(testFilePath), new TextEncoder().encode(testFormat));
			}
		});
	});

	/**
	 * test.each
	 */
	vscode.commands.registerCommand("vscode-jest-generator.test-each", (fileName: string) => {
		vscode.workspace.workspaceFolders?.map(async (item) => {
			const targetFilePathAry = fileName.split(item.uri.fsPath)[1].split("\\");
			const testFileName = targetFilePathAry.pop()?.replace('.', '.spec.');
			const testFilePath = item.uri.fsPath + '\\tests\\' + targetFilePathAry.filter((path, idx) => {
				if (idx > 1) { return true; }
				return false;
			}).join('\\') + '\\' + testFileName;

			try {
				// exists file
				const existsBuffer = await vscode.workspace.fs.readFile(vscode.Uri.file(testFilePath));
				const existsText = Buffer.from(Uint8Array.from(existsBuffer)).toString();

				await vscode.workspace.fs.writeFile(vscode.Uri.file(testFilePath), new TextEncoder().encode(existsText + '\n' + testEachFormat));
			} catch {
				// not exists file
				await vscode.workspace.fs.writeFile(vscode.Uri.file(testFilePath), new TextEncoder().encode(testEachFormat));
			}
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
