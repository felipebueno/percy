const vscode = require("vscode");
const fs = require("fs");
const {
  GO_TO_SCSS_COMMAND,
  NEW_COMPONENT_COMMAND,
  NEW_PAGE_COMMAND,
  CODE_FILE_REGEXP,
  STYLE_REGEXP,
  SCSS_TYPE,
  SASS_TYPE,
  CSS_TYPE,
  JS_TYPE,
  TS_TYPE,
  NODE_MODULES_FOLDER
} = require("./command");

const openTextEditor = filename => {
  vscode.workspace
    .openTextDocument(vscode.Uri.file(filename))
    .then(vscode.window.showTextDocument);
};

const openFile = fileToOpen => {
  vscode.workspace.findFiles(fileToOpen, NODE_MODULES_FOLDER).then(files => {
    openTextEditor(files[0].fsPath);
  });
};

const fetchFile = (extension, path, filenameWithoutExtension) => {
  return extension
    .map(ext => `${path}${filenameWithoutExtension}${ext}`)
    .filter(file => fs.existsSync(file));
};

const toKebabCase = (str) => {
  return str.split('').map((letter, idx) => {
    return letter.toUpperCase() === letter
      ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
      : letter;
  }).join('');
}

const toPascalCase = (str) => {
  const ret = str.replace(/(\w)(\w*)/g,
    function (_g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });

  return ret.replace('-', '');
};

const activate = context => {
  const subscription = vscode.commands.registerCommand(
    GO_TO_SCSS_COMMAND,
    () => {
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

      const openedFile = openedFileName.match(isCodeFile);
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
        }
      } else {
        const fileToOpen = fetchFile(
          codeExtensions,
          path,
          filenameWithoutExtension
        );

        if (fileToOpen.length > 0) {
          openTextEditor(fileToOpen[0]);
        }
      }
    }
  );

  const newComponentSubscription = vscode.commands.registerCommand(
    NEW_COMPONENT_COMMAND,
    () => {
      if (!vscode.workspace.name) {
        return;
      }

      console.log('new component called');
    }
  );

  const newPageSubscription = vscode.commands.registerCommand(
    NEW_PAGE_COMMAND,
    () => {
      if (!vscode.workspace.name) {
        return;
      }

      console.log('new page called');
    }
  );

  context.subscriptions.push(subscription);
  context.subscriptions.push(newComponentSubscription);
  context.subscriptions.push(newPageSubscription);
};

module.exports = activate;
