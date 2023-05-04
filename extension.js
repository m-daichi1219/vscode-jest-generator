const vscode = require('vscode');
const run = require('jest-test-gen').run;
const fs = require('fs-extra');

function createFilePath(filePath) {
	const workspaceFsPath = vscode.workspace.workspaceFolders[0].uri._fsPath;
	const targetFilePathAry = filePath.split(workspaceFsPath)[1].split("\\");
	const testFilePath = workspaceFsPath + '\\tests\\' + targetFilePathAry.filter((path, idx) => {
		if (idx > 1) { return true; }
		return false;
	}).join('\\');

	return testFilePath;
}

function activate(context) {
	let disposable = vscode.commands.registerCommand('vscode-jest-generator.test', function () {
		const doc = vscode.window.activeTextEditor.document;
		const testFilePath = createFilePath(doc.fileName);
		if (!fs.existsSync(testFilePath)) { fs.mkdirsSync(testFilePath); };
		const testFilename = run({ outputDir: testFilePath, fileSuffix: '.generated.spec', _: [doc.fileName] });
		const generatedTestFileUri = vscode.Uri.file(testFilename);
		vscode.window.showTextDocument(generatedTestFileUri);
	});

	context.subscriptions.push(disposable);
};

function deactivate() { };

module.exports = {
	activate,
	deactivate
};
