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

const resultsToString = (resultSet, indent) => {
	return Object.keys(resultSet).reduce( (ret, path) => {
		const { matches, filePath } = resultSet[path];

		return (
			`${ret}\n`+
			`${filePath}:\n`+
			`${matchesToString(matches, indent)}\n`
		);
	}, '');
};

export default resultsToString;
