import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"
import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"
import forms from "@tailwindcss/forms"
import typography from "@tailwindcss/typography"
import lineClamp from "@tailwindcss/line-clamp"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["CircularXXSub", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "3xl": [
          "2rem",
          {
            lineHeight: "2.5rem",
            letterSpacing: "0.02rem",
          },
        ],
      },
      spacing: {
        "2px": "2px",
        15: "3.75rem",
      },
      maxWidth: {
        "8xl": "95rem",
      },
      colors: {
        secondary: "rgba(128, 128, 128, 1)",
        black: "#041417",
        gray: {
          ...colors.gray,
          600: "#8d8d8d",
          500: "#bbb",
          400: "rgba(217, 217, 217, 1)",
          300: "#e4e4e4",
          200: "rgba(241, 241, 241, 1)",
          100: "#f0f0f0",
        },
        silver: {
          200: "#8b8d98",
        },
        blue: {
          300: "#101d46",
        },
        primary: {
          DEFAULT: "#1c1f24",
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
