const assert = require('assert');
const raise = require('./raise-comments.js').raise;

function test(name, input, expected) {
	function unindent(code) {
		return code.replace(/^\t/gm, '').trim();
	}
	describe(name, () => {
		it('should work', function () {
			assert.equal(raise(unindent(input)), unindent(expected));
		});
	});
}

// Test the basic ability of the library to move the block comments to the top.
test('Basic Test',
`
	/**
	 * A foo function
	 */
	function foo() {

	}

	/**
	 * A bar function
	 */
	function bar() {

	}
`,`
	/**
	 * A foo function
	 */
	/**
	 * A bar function
	 */
	function foo(){}function bar(){}
`);

// Ensure that adjacent alphanumeric tokens get whitespace between them
// and that other whitespace stays stripped.
test('Alphanumeric Test',
`
	var a = typeof b;
`,`
	var a=typeof b;
`);
