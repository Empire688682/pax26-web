export const buildPax26Theme = (theme) => {
  const isLight = theme === "light";

  return {
    bg:          isLight ? "#f0f4ff" : "#01050f",
    secondaryBg: isLight ? "#e4eaf7" : "#0d1526",
    ctBg:        isLight ? "#64748b" : "#01050f",
    footerBg:    isLight ? "#c8d9f5" : "#01050f",
    publicBg:    isLight ? "#dce4f0" : "#0b1220",
    header:      isLight ? "#c8d9f5" : "#01050f",
    card:        isLight ? "#ffffff" : "#0d1526",

    primary:     isLight ? "#2563eb" : "#3b82f6",

    textPrimary:   isLight ? "#1e293b" : "#f1f5f9",
    textSecondary: isLight ? "#64748b" : "#94a3b8",

    border:      isLight ? "rgba(19,27,47,0.15)" : "rgba(241,245,249,0.08)",

    toTopColor: isLight ? "#f1f5f9" : "#131b2f",
    btn:        isLight ? "#3b82f6" : "#a5bef3",
    btnHover:   isLight ? "#2563eb" : "#e2e6ee",

    fxBlob1:    isLight ? "rgba(59,130,246,0.12)"  : "rgba(59,130,246,0.07)",
    fxBlob2:    isLight ? "rgba(99,102,241,0.10)"  : "rgba(99,102,241,0.06)",
    fxBlob3:    isLight ? "rgba(37,99,235,0.08)"   : "rgba(16,185,129,0.05)",
    fxGrid:     isLight ? "rgba(30,41,59,0.04)"    : "rgba(255,255,255,0.025)",
    fxNoise:    isLight ? "rgba(30,41,59,0.018)"   : "rgba(255,255,255,0.012)",
  };
};