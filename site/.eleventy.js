
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css")
  eleventyConfig.addPassthroughCopy("icons")

  eleventyConfig.addPassthroughCopy("manifest.webmanifest")
  eleventyConfig.addPassthroughCopy("sw.js")
}
