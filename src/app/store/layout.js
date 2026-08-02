/**
 * store/layout.js
 *
 * Dedicated layout for all /store/* pages.
 * Renders WITHOUT the Pax26 dashboard shell (no Sidebar, no Header,
 * no BackgroundFX) so customers get a clean storefront experience.
 *
 * ThemeProvider is intentionally excluded — the storefront uses its
 * own light/neutral theme independent of the user's dashboard preference.
 */

export default function StoreLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {children}
    </div>
  );
}
