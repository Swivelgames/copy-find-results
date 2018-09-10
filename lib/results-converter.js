'use babel';

const getLineNumber = (range) => {
	let lineNumber = 0;

	try {
		lineNumber = range[0][0];
	} catch(e) {
		try {
			lineNumber = range.start.row;
		} catch(e) {}
	}

	return lineNumber + 1;
}

const matchesToString = (matches, indent) => {
	return matches.reduce( (ret, match) => {
		const { lineText, range } = match;
		const lineNumber = getLineNumber(range);

		return (
			`${ret}`+
			`${indent}${lineNumber}:`+
			`${indent}${lineText}\n`
		);
	}, '');
};

const isFileCollapsed = (filePath) => {
	const selectorParent = '.list-nested-item.collapsed';
	const selectorListItem = `[data-file-path="${filePath}"]`;
	try {
		const res = atom.document.querySelectorAll(`${selectorParent} ${selectorListItem}`);
		return res.length > 0;
	} catch(e) {
		return false;
	}
	return false;
};

const resultsToString = (resultSet, indent) => {
	return Object.keys(resultSet).reduce( (ret, path) => {
		const { matches, filePath } = resultSet[path];

		const isCollapsed = isFileCollapsed(filePath);

		let textToShow = matchesToString(matches, indent);

		if (isCollapsed) {
			if (atom.config.get('copy-find-results.textExcludeCollapsedFiles')) return ret;
			if (atom.config.get('copy-find-results.textHideResultsFromCollapsedFiles')) textToShow = '';
		}

		return (
			`${ret}\n`+
			`${filePath}:\n`+
			`${textToShow}\n`
		);
	}, '');
};

export default resultsToString;
