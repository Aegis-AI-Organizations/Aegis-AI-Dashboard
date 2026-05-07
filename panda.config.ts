import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,
  presets: ["@pandacss/dev/presets"],

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      semanticTokens: {
        colors: {
          brand: {
            primary: { value: "{colors.cyan.400}" },
            secondary: { value: "{colors.purple.500}" },
            accent: { value: "{colors.cyan.500}" },
          },
          bg: {
            main: { value: "{colors.dark.900}" },
            card: { value: "{colors.dark.800}" },
            surface: { value: "#12151C" },
          },
          text: {
            main: { value: "#e5e7eb" },
            muted: { value: "#9ca3af" },
            bright: { value: "#ffffff" },
          },
        },
        spacing: {
          pagePadding: { value: "{spacing.8}" },
          cardPadding: { value: "{spacing.6}" },
          sectionGap: { value: "{spacing.10}" },
        },
      },
      tokens: {
        colors: {
          cyan: {
            400: { value: "#00f2ff" },
            500: { value: "#00d9e6" },
            900: { value: "#00484c" },
          },
          purple: {
            400: { value: "#8e33ff" },
            500: { value: "#7000ff" },
            600: { value: "#5700cc" },
          },
          dark: {
            900: { value: "#050810" },
            800: { value: "#0B0D13" },
          },
          whiteAlpha: {
            50: { value: "rgba(255, 255, 255, 0.05)" },
            100: { value: "rgba(255, 255, 255, 0.1)" },
            200: { value: "rgba(255, 255, 255, 0.2)" },
            300: { value: "rgba(255, 255, 255, 0.3)" },
          },
          slate: {
            950: { value: "#020617" },
          },
          red: {
            200: { value: "#fecaca" },
            400: { value: "#f87171" },
            500: { value: "#ef4444" },
          },
        },
        fonts: {
          sans: { value: '"Inter", ui-sans-serif, system-ui, sans-serif' },
          orbitron: {
            value: '"Orbitron", ui-sans-serif, system-ui, sans-serif',
          },
        },
        fontSizes: {
          title: { value: "2.5rem" },
          subtitle: { value: "1.25rem" },
          section: { value: "1.5rem" },
        },
        animations: {
          pulse: { value: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
          spin: { value: "spin 1s linear infinite" },
          fadeIn: { value: "fadeIn 0.5s ease-out" },
          zoomIn: { value: "zoomIn 0.3s ease-out" },
          slideInFromTop: { value: "slideInFromTop 0.3s ease-out" },
          slideInFromRight: { value: "slideInFromRight 0.3s ease-out" },
          slideInFromBottom: { value: "slideInFromBottom 0.3s ease-out" },
          ping: { value: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite" },
          bounce: { value: "bounce 1s infinite" },
        },
      },
      recipes: {
        pageTitle: {
          className: "pageTitle",
          base: {
            fontFamily: "orbitron",
            fontSize: { base: "2xl", md: "title" },
            fontWeight: "black",
            color: "text.bright",
            letterSpacing: "tighter",
            lineHeight: "tight",
            mb: "2",
            textShadow: "0 0 20px rgba(0, 242, 255, 0.2)",
          },
        },
        pageSubtitle: {
          className: "pageSubtitle",
          base: {
            color: "text.muted",
            fontSize: "md",
            fontWeight: "medium",
            maxW: "2xl",
            lineHeight: "relaxed",
          },
        },
        sectionTitle: {
          className: "sectionTitle",
          base: {
            fontSize: "lg",
            fontWeight: "bold",
            color: "text.bright",
            textTransform: "uppercase",
            letterSpacing: "widest",
            opacity: 0.8,
            mb: "4",
            display: "flex",
            alignItems: "center",
            gap: "2",
          },
        },
        button: {
          className: "button",
          base: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2",
            borderRadius: "xl",
            fontWeight: "black",
            textTransform: "uppercase",
            letterSpacing: "widest",
            fontSize: "xs",
            px: "6",
            py: "3.5",
            transition: "all",
            cursor: "pointer",
            _disabled: { opacity: 0.5, cursor: "not-allowed" },
            _active: { transform: "scale(0.98)" },
          },
          variants: {
            variant: {
              primary: {
                bg: "brand.primary",
                color: "slate.950",
                shadow: "0 0 15px rgba(34,211,238,0.2)",
                _hover: {
                  bg: "brand.accent",
                  shadow: "0 0 25px rgba(34,211,238,0.4)",
                },
              },
              secondary: {
                bg: "whiteAlpha.100",
                color: "white",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                _hover: { bg: "whiteAlpha.200" },
              },
              danger: {
                bg: "red.500/10",
                color: "red.400",
                border: "1px solid",
                borderColor: "red.500/20",
                _hover: { bg: "red.500", color: "white" },
              },
              outline: {
                bg: "transparent",
                color: "brand.primary",
                border: "1px solid",
                borderColor: "brand.primary/30",
                _hover: { borderColor: "brand.primary", bg: "brand.primary/5" },
              },
              ghost: {
                bg: "transparent",
                color: "text.muted",
                _hover: { color: "text.bright", bg: "whiteAlpha.50" },
              },
            },
            size: {
              sm: { px: "4", py: "2", fontSize: "[10px]" },
              md: { px: "6", py: "3.5", fontSize: "xs" },
              lg: { px: "8", py: "4.5", fontSize: "sm" },
            },
          },
          defaultVariants: {
            variant: "primary",
            size: "md",
          },
        },
        card: {
          className: "card",
          base: {
            bg: "bg.card",
            borderRadius: "[2rem]",
            p: "cardPadding",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            position: "relative",
            overflow: "hidden",
          },
        },
        input: {
          className: "input",
          base: {
            bg: "whiteAlpha.50",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            borderRadius: "xl",
            p: "3.5",
            color: "white",
            fontSize: "sm",
            w: "full",
            transition: "all",
            _focus: {
              borderColor: "brand.primary",
              outline: "none",
              bg: "whiteAlpha.100",
            },
            _placeholder: { color: "text.muted" },
          },
        },
        badge: {
          className: "badge",
          base: {
            px: "2.5",
            py: "0.5",
            borderRadius: "md",
            fontSize: "[10px]",
            fontWeight: "black",
            textTransform: "uppercase",
            letterSpacing: "widest",
            display: "inline-flex",
            alignItems: "center",
          },
          variants: {
            variant: {
              success: { bg: "emerald.500/10", color: "emerald.400" },
              danger: { bg: "rose.500/10", color: "rose.400" },
              warning: { bg: "amber.500/10", color: "amber.400" },
              info: { bg: "brand.primary/10", color: "brand.primary" },
            },
          },
        },
        table: {
          className: "table",
          base: {
            w: "full",
            textAlign: "left",
            borderCollapse: "separate",
            borderSpacing: "0 8px",
            "& thead th": {
              fontSize: "xs",
              fontWeight: "black",
              color: "text.muted",
              textTransform: "uppercase",
              letterSpacing: "widest",
              px: "4",
              py: "2",
            },
            "& tbody tr": {
              bg: "whiteAlpha.50",
              _hover: { bg: "whiteAlpha.100" },
              transition: "background 0.2s",
            },
            "& tbody td": {
              px: "4",
              py: "4",
              color: "text.main",
              fontSize: "sm",
              "&:first-child": {
                borderTopLeftRadius: "xl",
                borderBottomLeftRadius: "xl",
              },
              "&:last-child": {
                borderTopRightRadius: "xl",
                borderBottomRightRadius: "xl",
              },
            },
          },
        },
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        zoomIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        slideInFromTop: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInFromBottom: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ping: {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
          },
          "50%": {
            transform: "none",
            animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "src/styled-system",

  // Enable JSX support
  jsxFramework: "react",
});
