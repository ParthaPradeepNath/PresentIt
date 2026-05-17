// //  @ts-check

// /** @type {import('prettier').Config} */
// const config = {
//   semi: false,
//   singleQuote: true,
//   trailingComma: "all",
// };

// export default config;
// @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  endOfLine: "lf",

  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],

  importOrder: [
    "^react$",
    "^@tanstack/react-start$",
    "^@tanstack/react-router$",
    "^@tanstack/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]",
  ],

  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
};

export default config;
