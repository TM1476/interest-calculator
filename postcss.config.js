module.exports = {
  // This configuration explicitly loads the Tailwind CSS plugin.
  // This is required to ensure Tailwind runs during the build process, 
  // scanning your files and generating the final CSS bundle.
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
