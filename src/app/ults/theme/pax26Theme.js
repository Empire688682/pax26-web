export const buildPax26Theme = (theme) => ({

  bg:          theme === "light" ? "#f0f4ff" : "#01050f",
  secondaryBg: theme === "light" ? "#e4eaf7" : "#0d1526",
  ctBg:        theme === "light" ? "#64748b" : "#01050f",
  footerBg:    theme === "light" ? "#c8d9f5" : "#01050f",
  publicBg:    theme === "light" ? "#dce4f0" : "#0b1220",
  header:      theme === "light" ? "#c8d9f5" : "#01050f",
  card:        theme === "light" ? "#ffffff"  : "#0d1526",

  primary:     theme === "light" ? "#2563eb" : "#3b82f6",

  textPrimary:   theme === "light" ? "#1e293b" : "#f1f5f9",
  textSecondary: theme === "light" ? "#64748b" : "#94a3b8",

  border:      theme === "light" ? "rgba(19,27,47,0.15)" : "rgba(241,245,249,0.08)",

  toTopColor: theme === "light" ? "#f1f5f9" : "#131b2f",
  btn:        theme === "light" ? "#3b82f6" : "#a5bef3",
  btnHover:   theme === "light" ? "#2563eb" : "#e2e6ee",

  fxBlob1:    theme === "light" ? "rgba(59,130,246,0.12)"  : "rgba(59,130,246,0.07)",
  fxBlob2:    theme === "light" ? "rgba(99,102,241,0.10)"  : "rgba(99,102,241,0.06)",
  fxBlob3:    theme === "light" ? "rgba(37,99,235,0.08)"   : "rgba(16,185,129,0.05)",
  fxGrid:     theme === "light" ? "rgba(30,41,59,0.04)"    : "rgba(255,255,255,0.025)",
  fxNoise:    theme === "light" ? "rgba(30,41,59,0.018)"   : "rgba(255,255,255,0.012)",
});