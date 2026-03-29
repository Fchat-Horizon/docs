/** @type {import('lint-staged').Config} */
const config = {
  '*.{js,ts,mjs,cjs,vue}': ['prettier --write'],
  '*.{json,md,markdown,html,yml,yaml,scss,css}': ['prettier --write'],
};

export default config;
