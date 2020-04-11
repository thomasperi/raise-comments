var esprima = require('esprima');
var through = require('through2');
/*global Buffer */

var alphas = [
	'Boolean',
	'Identifier', // includes NaN and undefined, presumably any others that meet identifier qualifications
	'Keyword',
	'Null',
	'Numeric',
	'Template'
];
var mistakes = [
	'++',
	'+++',
	'--',
	'---'
];

function raiseComments(input) {
	var tokens = esprima.tokenize(input, {
		comment: true
	});

	var comments = [],
		code = [],
		prev;
	
	for (let i = 0, len = tokens.length; i < len; i++) {
		let token = tokens[i];
		switch (token.type) {
			// Bring block comments to the top
			case 'BlockComment':
				comments.push('/*' + token.value + '*/\n');
				break;
		
			// Throw away line comments
			case 'LineComment':
				break;
			
			// Insert spaces where needed:
			// - Between alphanumeric tokens
			// - Between a regexp literal and an alphanumeric
			// - Between operators that would produce mistakes if joined:
			//   + + => ++
			//   - - => --
			//   ++ + | + ++ => +++
			//   -- - | - -- => ---
			default:
				let leftAlpha = prev && alphas.includes(prev.type),
					leftRegex = prev && prev.type === 'RegularExpression',
					rightAlpha = alphas.includes(token.type);
				if (
					((leftAlpha || leftRegex) && rightAlpha) ||
					(prev && mistakes.includes(prev.value + token.value))
				) {
					code.push(' ');
				}
				code.push(token.value);
		}
		prev = token;
	}

	return comments.join('') + code.join('');
}

function gulpRaise() {
	return through.obj(function (file, enc, callback) {
		if (file.isBuffer()) {
			file.contents = Buffer.from(
				raiseComments(
					file.contents.toString()
				)
			);
		}
		return callback(null, file);
	});
}

module.exports = {
	raise: raiseComments,
	gulp: gulpRaise
};
