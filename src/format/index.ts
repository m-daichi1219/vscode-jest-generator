import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { TextEncoder } from 'util';

export const funcRegex = /(export function|export const|export async const|export async function)/g;

/**
 * 対象のファイル名からテストファイル名を作成
 * @param fileName `fileName.ts`
 * @return `fileName.spec.ts`
 */
export const createTestFileName = (fileName: string, ext: string = '.ts', suffix: string = 'spec'): string => {
    return fileName.replace(ext, `.${suffix}${ext}`);
};

/**
 * 対象のファイルからテストファイルの絶対パスを作成
 * @param projectRoot `c://foo/bar/`
 * @param activeFileAbsolutePath `c://foo/bar/src/file.ts`
 * @param testFileName `file.spec.ts`
 * @returns 
 */
export const createTestFileAbsolutePath = (projectRoot: string, activeFileAbsolutePath: string, testFileName: string): string => {
    const targetFilePathAry = activeFileAbsolutePath.split(projectRoot)[1].split("\\");
    targetFilePathAry.pop();
    const testFilePath = projectRoot + '\\tests\\' + targetFilePathAry.filter((path, idx) => {
        if (idx > 1) { return true; }
        return false;
    }).join('\\') + '\\' + testFileName;

    return testFilePath;
};

/**
 * CodeLensの表示位置から関数名を取得
 * @param line 
 * @returns 
 */
export const getFunctionName = (line: vscode.TextLine): string => {
    const matcher = /export\s+(?:async\s+)?(?:function\s+)?(?:const\s+)?(\w+)|export\s+class\s+(\w+)/;

    const text = line.text;
    const matches = text.match(matcher);
    if (!matches || !matches[1]) {
        // function name Not found
        return '';
    }
    return matches[1];
};

/**
 * テストファイルに記載するテストコードを生成
 * @param funcName 対象の関数名
 * @param testFileAbsolutePath テストファイルの絶対パス
 * @param activeFileAbsolutePath テスト対象ファイルの絶対パス
 * @param ext テスト対象ファイルの拡張子
 * @returns テストコード
 */
export const createTestContent = (funcName: string, testFileAbsolutePath: string, activeFileAbsolutePath: string, ext: string = '.ts'): string => {
    const contents = `import { ${funcName} } from './${path.relative(path.dirname(testFileAbsolutePath), activeFileAbsolutePath).replace(/\\/g, '/').replace(ext, '')}';

describe('${funcName}', () => {
  test('case', () => {
    // TODO: write test
  });
});
`;

    return contents;
};

/**
 * テストファイルに記載するテストコードを生成
 * @param funcName 対象の関数名
 * @param testFileAbsolutePath テストファイルの絶対パス
 * @param activeFileAbsolutePath テスト対象ファイルの絶対パス
 * @param ext テスト対象ファイルの拡張子
 * @returns テストコード
 */
export const createTestEachContent = (funcName: string, testFileAbsolutePath: string, activeFileAbsolutePath: string, ext: string = '.ts'): string => {
    const contents = `import { ${funcName} } from './${path.relative(path.dirname(testFileAbsolutePath), activeFileAbsolutePath).replace(/\\/g, '/').replace(ext, '')}';

describe('${funcName}', () => {
  test.each([
    {a: 1, b: 1, expected: 2},
    {a: 1, b: 2, expected: 3},
    {a: 2, b: 1, expected: 3},
  ])('case a:$a b:$b exp:$expected', ({a, b, expected}) => {
    // TODO: write test
  });
});

    `;

    return contents;
};

/**
 * テストファイルにテストコードを追加
 * @param testFileAbsolutePath テストファイルの絶対パス
 * @param contents テストコード
 */
export const writeTestFile = async (testFileAbsolutePath: string, contents: string): Promise<void> => {
    console.log(testFileAbsolutePath);
    if (fs.existsSync(testFileAbsolutePath)) {
        const existsBuffer = await vscode.workspace.fs.readFile(vscode.Uri.file(testFileAbsolutePath));
        const existsText = Buffer.from(Uint8Array.from(existsBuffer)).toString();

        await vscode.workspace.fs.writeFile(vscode.Uri.file(testFileAbsolutePath), new TextEncoder().encode(existsText + '\n' + contents));
    } else {
        await vscode.workspace.fs.writeFile(vscode.Uri.file(testFileAbsolutePath), new TextEncoder().encode(contents));
    }
};