// .eslintrc.js
module.exports = {
  parserOptions: {
    "parser": "babel-eslint",
    "ecmaVersion": 2017,
    "sourceType": "module",
    "allowImportExportEverywhere": false,
    "codeFrame": false
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/essential",
    "plugin:vue/strongly-recommended",
  ],
  rules: {
    "vue/no-side-effects-in-computed-properties": "off",
    "vue/no-reserved-keys": "warn",
    "vue/require-prop-types": "warn",
    "vue/name-property-casing": "warn",
    "no-process-env": "off",
    "no-unused-vars": ["warn", {"args": "none", "ignoreRestSiblings": true}],
    "no-undef": "error",
    "no-redeclare": "warn",
    "no-empty": "warn",
    "no-console": "warn",
    "quotes": ["warn", "double", {"allowTemplateLiterals": true}],
    "comma-spacing": ["warn", {"before": false, "after": true}],
    "indent": ["warn", 2],
    "object-curly-spacing": ["warn", "never"],
    "key-spacing": "warn",
    "array-bracket-spacing": "warn",
    "block-spacing": ["warn", "never"],
    "func-call-spacing": ["warn", "never"]
  },
  globals: {
    "SERVER_URL": false,
    "IS_PROD": false
  },
  env: {
    "browser": true,
    "node": true,
    "amd": true
  }
}
