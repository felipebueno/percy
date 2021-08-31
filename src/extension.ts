// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const fs = require("fs");

const GO_TO_SCSS_COMMAND = "extension.switchStyleComponent";
const NEW_COMPONENT_COMMAND = "extension.newComponent";
const NEW_PAGE_COMMAND = "extension.newPage";
const CODE_FILE_REGEXP = /(.*(\/.*\/))(.*)(\.\w+)$/;
const STYLE_REGEXP = /(\.|_|-)(scss|css|sass|less)/;
const SCSS_TYPE = ".scss";
const SASS_TYPE = ".sass";
const CSS_TYPE = ".css";
const JS_TYPE = ".js";
const TS_TYPE = ".ts";
const NODE_MODULES_FOLDER = "**/node_modules/**";


const openTextEditor = (filename: string) => {
	vscode.workspace
		.openTextDocument(vscode.Uri.file(filename))
		.then(vscode.window.showTextDocument);
};

const openFile = (fileToOpen: any) => {
	vscode.workspace.findFiles(fileToOpen, NODE_MODULES_FOLDER).then(files => {
		openTextEditor(files[0].fsPath);
	});
};

const fetchFile = (extension: any, path: string, filenameWithoutExtension: any) => {
	return extension
		.map((ext: any) => `${path}${filenameWithoutExtension}${ext}`)
		.filter((file: any) => fs.existsSync(file));
};

const toKebabCase = (str: string) => {
	return str.split('').map((letter: string, idx: number) => {
		return letter.toUpperCase() === letter
			? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
			: letter;
	}).join('');
}

const toPascalCase = (str: string) => {
	const ret = str.replace(/(\w)(\w*)/g,
		function (_g0: any, g1: string, g2: string) { return g1.toUpperCase() + g2.toLowerCase(); });

	return ret.replace('-', '');
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "percy-code" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable0 = vscode.commands.registerCommand(GO_TO_SCSS_COMMAND, () => {
		if (!vscode.workspace.name) {
			return;
		}

		const cssRootPath = `${vscode.workspace.rootPath}/public/css/`;
		const tsRootPath = `${vscode.workspace.rootPath}/src/scripts/percival/`;
		const activeTextEditor = vscode.window.activeTextEditor;

		if (!activeTextEditor) {
			return;
		}

		const openedFileName = activeTextEditor.document.fileName;
		const isCodeFile = CODE_FILE_REGEXP;

		const openedFile: any = openedFileName.match(isCodeFile);

		if (!openedFile) {
			return;
		}

		const path = openedFile[4] === TS_TYPE ? `${cssRootPath}${openedFile[2]}` : `${tsRootPath}${openedFile[2]}`;
		const lastPath = openedFile[2];
		const filenameWithoutExtension = openedFile[4] === TS_TYPE ? toKebabCase(openedFile[3]) : toPascalCase(openedFile[3]);
		const filenameExtension = openedFile[4];

		const isStyleFile = STYLE_REGEXP;
		const styleExtensions = [SCSS_TYPE, SASS_TYPE, CSS_TYPE];
		const codeExtensions = [TS_TYPE, JS_TYPE];

		if (!isStyleFile.test(openedFile)) {
			const suffixToOpen = fetchFile(
				styleExtensions,
				path,
				filenameWithoutExtension
			);

			if (suffixToOpen.length > 0) {
				openTextEditor(suffixToOpen[0]);
			} else {
				const fileToOpen = `**${lastPath}${filenameWithoutExtension}${filenameExtension}`;
				openFile(fileToOpen);
				vscode.window.showInformationMessage(`The style file ${filenameWithoutExtension}.css does not exist. Would you like to create it?`, 'Yes', 'No')
					.then((res) => {
						console.log(res);
						if (res === 'Yes') {
							const writeStr = `${filenameWithoutExtension} {}`;
							const writeData = Buffer.from(writeStr, 'utf8');
							vscode.workspace.fs.writeFile(vscode.Uri.file(path + filenameWithoutExtension + '.css'), writeData)
								.then((_res) => {
									const suffixToOpen = fetchFile(
										styleExtensions,
										path,
										filenameWithoutExtension
									);

									if (suffixToOpen.length > 0) {
										openTextEditor(suffixToOpen[0]);
									} else {
										vscode.window.showInformationMessage('File not found :(');
									}
								});
						}
					});
			}
		} else {
			const fileToOpen = fetchFile(
				codeExtensions,
				path,
				filenameWithoutExtension
			);

			if (fileToOpen.length > 0) {
				openTextEditor(fileToOpen[0]);
			} else {
				vscode.window.showInformationMessage(NEW_COMPONENT_COMMAND);
			}
		}
	});

	const disposable1 = vscode.commands.registerCommand(NEW_COMPONENT_COMMAND, () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage(NEW_COMPONENT_COMMAND);
	});

	const disposable2 = vscode.commands.registerCommand(NEW_PAGE_COMMAND, () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage(NEW_PAGE_COMMAND);
	});

	context.subscriptions.push(disposable0, disposable1, disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() { }
