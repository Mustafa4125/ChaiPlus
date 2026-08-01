module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--fg)'
      },
      borderRadius: {
        '2xl': '1rem'
      }
    }
  },
  plugins: []
};
