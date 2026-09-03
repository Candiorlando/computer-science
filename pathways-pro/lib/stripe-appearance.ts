import type { Appearance } from "@stripe/stripe-js";

// Stripe Elements appearance configuration — matches Pathways Pro's
// Tailwind design system (accent #0F6B54, cream #F5F2E9, ink #1c211e).
//
// This is passed to <Elements options={{ appearance }}> so the embedded
// Stripe inputs (card number, expiry, CVC) visually match the app's
// form fields. All sensitive input remains inside Stripe's PCI-compliant
// iframe — only styling is configured here (PCI-DSS SAQ A compliant).

export const stripeAppearance: Appearance = {
  theme: "stripe",
  variables: {
    // Colors
    colorPrimary: "#0F6B54",            // accent (deep mint green)
    colorBackground: "#FFFFFF",
    colorText: "#1c211e",               // ink
    colorDanger: "#DC2626",
    colorTextSecondary: "#6B7280",
    colorTextPlaceholder: "#9CA3AF",

    // Typography
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSizeBase: "14px",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "600",

    // Spacing & shape
    borderRadius: "6px",
    spacingUnit: "4px",
    spacingGridRow: "16px",
    spacingGridColumn: "16px",

    // Focus ring
    focusBoxShadow: "0 0 0 2px rgba(15, 107, 84, 0.25)",
    focusOutline: "none",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(31, 29, 26, 0.2)",
      padding: "10px 12px",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    },
    ".Input:focus": {
      borderColor: "#0F6B54",
      boxShadow: "0 0 0 2px rgba(15, 107, 84, 0.25)",
    },
    ".Input--invalid": {
      borderColor: "#DC2626",
      boxShadow: "0 0 0 2px rgba(220, 38, 38, 0.15)",
    },
    ".Label": {
      fontSize: "10px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "rgba(31, 29, 26, 0.6)",
      marginBottom: "4px",
    },
    ".Tab": {
      borderRadius: "6px",
      border: "1px solid rgba(31, 29, 26, 0.15)",
    },
    ".Tab--selected": {
      borderColor: "#0F6B54",
      backgroundColor: "rgba(15, 107, 84, 0.05)",
      color: "#0F6B54",
    },
    ".Tab:hover": {
      borderColor: "#0F6B54",
    },
  },
};
