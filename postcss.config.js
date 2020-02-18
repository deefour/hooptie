/**
 * @link https://tailwindcss.com/docs/controlling-file-size/#setting-up-purgecss
 */
const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/**/*.vue", "./src/**/*.pug"],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
});

module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    require("postcss-nested"),
    ...(process.env.NODE_ENV === "production" ? [purgecss] : [])
  ]
};
