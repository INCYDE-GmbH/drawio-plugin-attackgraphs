module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'github',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: { project: ['./src/tsconfig.json'] },
    }
  ],
  rules: {
    'quotes': [2, 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'no-console': 2,
    'eqeqeq': [2, 'always'],
    'prefer-arrow-callback': 2,
    'curly': 2,
    'brace-style': 2,
    'max-statements-per-line': 2,
    'github/array-foreach': 2,
    'github/no-then': 2,
  },
};
