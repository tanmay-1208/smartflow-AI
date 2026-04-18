// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0B1426",
          800: "#111E35",
          700: "#1A2D4F",
          600: "#243C6A",
        },
        saffron: {
          400: "#FFAA33",
          500: "#F59E0B",
          600: "#D97706",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
 

