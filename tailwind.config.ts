import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"
import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"
import forms from "@tailwindcss/forms"
import typography from "@tailwindcss/typography"
import lineClamp from "@tailwindcss/line-clamp"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["CircularXXSub", ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        "2px": "2px",
        15: "3.75rem",
      },
      colors: {
        secondary: "#95B0B2",
        black: "#041417",
        gray: {
          ...colors.gray,
          900: "#031417",
          850: "#0E2A2F",
          800: "#13383E",
          700: "#144448",
          600: "#1E4D52",
          500: "#24545B",
          400: "#3E737A",
          300: "#799DA2",
          200: "#4BA2A6",
        },
        silver: {
          300: "#3D5458",
          200: "#9BAFB2",
        },
        green: {
          100: "#38626A",
        },
        lime: {
          500: "#1EDE1D",
        },
        primary: {
          DEFAULT: "#5DEB5A",
        },
        yellow: {
          300: "#FDFC47",
        },
      },
      scale: {
        103: "1.03",
      },
      borderRadius: {
        "4xl": "1.875rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    forms,
    typography,
    lineClamp,
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".hide-scrollbar": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },

        ".hide-spinners": {
          "-moz-appearance": "textfield",
          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: "0",
          },
        },
      }
      addUtilities(newUtilities)
    }),
  ],
}
export default config
