/**
 * storeThemes.js
 *
 * All available storefront themes.
 * Each theme defines a complete color set used by StorefrontPage
 * and ProductDetailPage to style the entire public storefront.
 *
 * Adding a new theme: add an entry here — no other changes needed.
 */

export const STORE_THEMES = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Clean white, timeless black — works for every business",
    preview: ["#ffffff", "#111111", "#f5f5f5"],
    bg: "#ffffff",
    pageBg: "#f8f8f6",
    card: "#ffffff",
    border: "#e8e8e6",
    accent: "#111111",
    accentText: "#ffffff",
    textPrimary: "#111111",
    textSecondary: "#666666",
    navBg: "#ffffff",
    footerBg: "#111111",
    footerText: "#ffffff",
    badgeBg: "#111111",
    badgeText: "#ffffff",
  },

  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Dark and premium — great for electronics and luxury goods",
    preview: ["#0f0f13", "#6366f1", "#1e1e28"],
    bg: "#1e1e28",
    pageBg: "#0f0f13",
    card: "#1e1e28",
    border: "#2e2e3e",
    accent: "#6366f1",
    accentText: "#ffffff",
    textPrimary: "#f0f0f8",
    textSecondary: "#9090a8",
    navBg: "#0f0f13",
    footerBg: "#090910",
    footerText: "#9090a8",
    badgeBg: "#6366f1",
    badgeText: "#ffffff",
  },

  forest: {
    id: "forest",
    name: "Forest",
    description: "Natural deep green — organic, food, or eco brands",
    preview: ["#ffffff", "#1a5c3a", "#f0f7f3"],
    bg: "#ffffff",
    pageBg: "#f0f7f3",
    card: "#ffffff",
    border: "#cce5d6",
    accent: "#1a5c3a",
    accentText: "#ffffff",
    textPrimary: "#0d2b1e",
    textSecondary: "#4a7a5e",
    navBg: "#ffffff",
    footerBg: "#0d2b1e",
    footerText: "#cce5d6",
    badgeBg: "#1a5c3a",
    badgeText: "#ffffff",
  },

  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Warm cream and amber — fashion, beauty, and lifestyle",
    preview: ["#fffbf5", "#d97706", "#fef3c7"],
    bg: "#fffbf5",
    pageBg: "#fef9ef",
    card: "#fffbf5",
    border: "#fde68a",
    accent: "#d97706",
    accentText: "#ffffff",
    textPrimary: "#3b1f00",
    textSecondary: "#92400e",
    navBg: "#fffbf5",
    footerBg: "#3b1f00",
    footerText: "#fde68a",
    badgeBg: "#d97706",
    badgeText: "#ffffff",
  },

  royal: {
    id: "royal",
    name: "Royal",
    description: "White and deep purple — luxury, beauty, and wellness",
    preview: ["#ffffff", "#7c3aed", "#f5f0ff"],
    bg: "#ffffff",
    pageBg: "#f5f0ff",
    card: "#ffffff",
    border: "#ddd6fe",
    accent: "#7c3aed",
    accentText: "#ffffff",
    textPrimary: "#1e0a4a",
    textSecondary: "#6d28d9",
    navBg: "#ffffff",
    footerBg: "#1e0a4a",
    footerText: "#ddd6fe",
    badgeBg: "#7c3aed",
    badgeText: "#ffffff",
  },

  ember: {
    id: "ember",
    name: "Ember",
    description: "Dark charcoal and red — bold streetwear and sneakers",
    preview: ["#1a1a1a", "#ef4444", "#262626"],
    bg: "#262626",
    pageBg: "#1a1a1a",
    card: "#262626",
    border: "#3a3a3a",
    accent: "#ef4444",
    accentText: "#ffffff",
    textPrimary: "#f5f5f5",
    textSecondary: "#a0a0a0",
    navBg: "#1a1a1a",
    footerBg: "#0f0f0f",
    footerText: "#a0a0a0",
    badgeBg: "#ef4444",
    badgeText: "#ffffff",
  },
};

/**
 * getTheme(id)
 * Returns the theme object for a given id. Falls back to "classic".
 */
export function getTheme(id) {
  return STORE_THEMES[id] || STORE_THEMES.classic;
}

/** Array of all themes — used for the picker UI */
export const THEME_LIST = Object.values(STORE_THEMES);
