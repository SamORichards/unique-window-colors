import Color from 'color';
import { ExtensionContext, workspace, WorkspaceFolder } from 'vscode';



export function activate(context: ExtensionContext) {

  // https://code.visualstudio.com/api/references/vscode-api
  // const config = workspace.getConfiguration('launch', vscode.window.activeTextEditor.document.uri);
  // console.log("JSON.stringify(workspace.getConfiguration('workbench').get('colorCustomizations'), null, 4)");
  // console.log(JSON.stringify(workspace.getConfiguration('workbench').get('colorCustomizations'), null, 4));

  if (!workspace.workspaceFolders) {
    return;
  }

  let workspaceRoot: string = getWorkspaceFolder(Array.from(workspace.workspaceFolders));

  const extensionTheme = workspace.getConfiguration('windowColors').get<string>('🌈 Theme');
  let baseColor = workspace.getConfiguration('windowColors').get<string>('🌈 BaseColor');
  if (baseColor) {
    baseColor = baseColor.toLowerCase().trim();
  }

  /** retain initial unrelated colorCustomizations*/
  const cc = JSON.parse(JSON.stringify(workspace.getConfiguration('workbench').get('colorCustomizations')));

  let sideBarColor: Color = Color('#' + stringToARGB(workspaceRoot));
  let titleBarTextColor: Color = Color('#ffffff');
  let titleBarColor: Color = Color('#ffffff');

  const sideBarColor_dark = getColorWithLuminosity(sideBarColor, .02, .027);
  const titleBarTextColor_dark = getColorWithLuminosity(sideBarColor_dark, 0.95, 1);
  const titleBarColor_dark = sideBarColor_dark.lighten(0.4);

  const sideBarColor_light = getColorWithLuminosity(sideBarColor, 0.45, 0.55);
  const titleBarTextColor_light = getColorWithLuminosity(sideBarColor_light, 0, 0.01);
  const titleBarColor_light = sideBarColor_light.lighten(0.1);

  if (extensionTheme === 'dark') {

    sideBarColor = sideBarColor_dark;
    titleBarTextColor = titleBarTextColor_dark;
    titleBarColor = titleBarColor_dark;
  }
  else if (extensionTheme === 'light') {

    sideBarColor = sideBarColor_light;
    titleBarTextColor = titleBarTextColor_light;
    titleBarColor = titleBarColor_light;
  }
  if (baseColor) {

    sideBarColor = Color(baseColor);
    titleBarColor = sideBarColor.lighten(0.3);

    if (titleBarColor.luminosity() > 0.5) { //a light color https://www.npmjs.com/package/color#luminosity
      titleBarTextColor = getColorWithLuminosity(sideBarColor, 0, 0.01);
    }
    else {
      titleBarTextColor = getColorWithLuminosity(sideBarColor, 0.95, 1);
    }
  }


  let doUpdateColors = true;

  if (cc && (cc['activityBar.background'] || cc['titleBar.activeBackground'] || cc['titleBar.activeForeground'])) {
    //don't overwrite
    doUpdateColors = false;
  }

  if (baseColor) {
    doUpdateColors = true;
  }

  if (doUpdateColors) {

    const newColors = {
      "activityBar.background": sideBarColor.hex(),
      "titleBar.activeBackground":  titleBarColor.hex(),
      "titleBar.activeForeground": titleBarTextColor.hex(),
      //these lines are for development since the extension demo doesn't show the formatted title bar
      // "sideBarSectionHeader.background": titleBarColor.hex(),
      // "sideBarSectionHeader.foreground": titleBarTextColor.hex()
    };
    workspace.getConfiguration('workbench').update('colorCustomizations', { ...cc, ...newColors }, false);
  }


  // for testing
  // setTimeout(() => {
  //   console.log("JSON.stringify(workspace.getConfiguration('workbench').get('colorCustomizations'), null, 4)");
  //   console.log(JSON.stringify(workspace.getConfiguration('workbench').get('colorCustomizations'), null, 4));
  // }, 2000);

  // console.log("JSON.stringify(workspace.getConfiguration('workbench').get('colorCustomizations'), null, 4)");
  // console.log(JSON.stringify(workspace.getConfiguration('workbench').get('colorCustomizations'), null, 4));
}

const getColorWithLuminosity = (color: Color, min: number, max: number): Color => {

  let c: Color = Color(color.hex());

  while (c.luminosity() > max) {
    c = c.darken(0.01);
  }
  while (c.luminosity() < min) {
    c = c.lighten(0.01);
  }
  return c;
}

//https://itnext.io/how-to-make-a-visual-studio-code-extension-77085dce7d82
// takes an array of workspace folder objects and return
// workspace root, assumed to be the first item in the array
export const getWorkspaceFolder = (folders: WorkspaceFolder[] |
  undefined): string => {
  if (!folders) {
    return '';
  }

  const folder = folders[0] || {};
  const uri = folder.uri;

  return uri.fsPath;
};

function stringToARGB(str: string) {
  return intToARGB(hashCode(str));
}

// https://www.designedbyaturtle.co.uk/convert-string-to-hexidecimal-colour-with-javascript-vanilla/
// Hash any string into an integer value
// Then we'll use the int and convert to hex.
function hashCode(str: string) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// https://www.designedbyaturtle.co.uk/convert-string-to-hexidecimal-colour-with-javascript-vanilla/
// Convert an int to hexadecimal with a max length
// of six characters.
function intToARGB(i: number) {
  var hex = ((i >> 24) & 0xFF).toString(16) +
    ((i >> 16) & 0xFF).toString(16) +
    ((i >> 8) & 0xFF).toString(16) +
    (i & 0xFF).toString(16);
  // Sometimes the string returned will be too short so we 
  // add zeros to pad it out, which later get removed if
  // the length is greater than six.
  hex += '000000';
  return hex.substring(0, 6);
}


// https://stackoverflow.com/questions/45218663/use-workbench-colorcustomizations-in-extension