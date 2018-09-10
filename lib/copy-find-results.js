'use babel';

import resultsToString from './results-converter.js';
import { CompositeDisposable } from 'atom';

export default {
  config: {
    textExcludeCollapsedFiles: {
      title: "Text Copy: Exclude Collapsed Files from Copy Buffer",
      description: "Enable this if you want to completely exclude files you've collapsed in the results UI.",
      type: "boolean",
      default: false
    },
    textHideResultsFromCollapsedFiles: {
      title: "Text Copy: Hide Results for Collapsed Files from Copy Buffer",
      description: "Enable this if you only want to see the file paths of files you've collapsed in the results UI.",
      type: "boolean",
      default: false
    }
  },

  subscriptions: null,

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'copy-find-results:text': () => this.copy('text'),
        'copy-find-results:json': () => this.copy('json')
      })
    );
  },

  deactivate: () => void 0,

  serialize: () => '',

  copy(type) {
    let text = '';
    try {
      text = (type === "json") ? this.toJSON() : this.toString();
    } catch(e) {
      let addtnl = '';
      try {
        const keys = this.getKeyStrokes();
        addtnl = `Use ${keys} to search!`;
      } catch(e) {}

      atom.notifications.addInfo(`No results copied. ${addtnl}`);
    }

    if (!text) return;

    try {
      atom.clipboard.write(text);
      atom.notifications.addSuccess("Copied!");
    } catch(e) {
      atom.notifications.addWarning("Problem copying text to clipboard");
      return;
    }

    try {
      atom.workspace.open().then(editor => {
        editor.setText(text);
        editor.setCursorScreenPosition([0,0]);
      });
    } catch(e) {}
  },

  getKeyStrokes() {
    const keys = atom.keymaps.findKeyBindings({
      command: 'project-find:show'
    });

    const key = keys.find(k => this.doesElementExist(k.selector));

    if (!key) return '';
    else {
      return key.keystrokes;
    }
  },

  doesElementExist(selector) {
    try {
      const res = atom.document.querySelectorAll(selector);
      return res.length > 0;
    } catch(e) {
      return false;
    }
  },

  toJSON() {
    const indent = this.getIndentChar();
    const { findOptions, results } = this.getResultsModel();
    const { findPattern, pathsPattern } = findOptions;

    const resultsObj = {
      patterns: {
        findPattern,
        pathsPattern
      },
      results
    };

    return JSON.stringify(
      resultsObj, null,
      this.getIndentChar()
    );
  },

  toString() {
    const indent = this.getIndentChar();
    const { findOptions, results } = this.getResultsModel();
    const { findPattern, pathsPattern } = findOptions;

    let ret = resultsToString(results, indent);

    return (
      `Results for "${
        findPattern
      }"${
        pathsPattern ? ` in "${pathsPattern}"` : ''
      }\n${ret}`
    );
  },

  getResultsModel() {
    return this.getFindAndReplace().resultsModel;
  },

  getResults() {
    return this.getResultsModel().results;
  },

  getIndentChar() {
  	const tabType = atom.config.get('editor:tabType') || "auto";
  	if (tabType === 'hard') {
      return "\t";
  	} else {
  		const tabLength = atom.config.get('editor:tabLength') || 2;
  		return " ".repeat(tabLength);
  	}
  },

  getFindAndReplace() {
    let pkg;
    try {
      pkg = atom.packages.loadedPackages['find-and-replace'];
    } catch(e) {
      throw new Error('Core package missing: `find-and-replace`');
    }

    return pkg.mainModule;
  }
};
