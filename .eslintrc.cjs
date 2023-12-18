module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: ['airbnb-base', 'plugin:prettier/recommended'],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	plugins: ['react-refresh', 'prettier'],
	rules: {
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		'no-shadow': 0,
		'no-param-reassign': 0,
		'import/no-unresolved': 0,
		'import/extensions': 0,
		'no-unused-vars': 0,
		'consistent-return': 0,
		'no-console': 0,
	},
};
