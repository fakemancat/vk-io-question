module.exports = {
    'env': {
        'es6': true,
        'node': true
    },
    'extends': ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    'parserOptions': {
        'ecmaVersion': 2019,
        'sourceType': 'module',
    },
    'parser': '@typescript-eslint/parser',
    'plugins': ['@typescript-eslint'],
    'rules': {
        'no-console': 0,
        'eqeqeq': 'error',
        'no-undef': 'warn',
        'no-empty': 'error',
        'linebreak-style': 0,
        'indent': ['error', 4],
        'prefer-const': 'error',
        'no-undefined': 'error',
        'no-dupe-args': 'error',
        'no-dupe-keys': 'error',
        'dot-notation': 'error',
        'no-extra-semi': 'error',
        'no-unused-vars': 'warn',
        'semi': ['error', 'always'],
        'block-scoped-var': 'error',
        'quotes': ['error', 'single'],
        'no-use-before-define': 'error',
        '@typescript-eslint/ts-ignore': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-empty-function': 0,
        'dot-location': ['error', 'property'],
    }
};