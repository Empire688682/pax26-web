/**
 * Custom not-found for /store/[slug] — shown when a slug doesn't exist.
 */
export default function StoreNotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", padding: "40px 20px",
      textAlign: "center", background: "#f8f8f6",
    }}>
      <div style={{ fontSize: "64px", marginBottom: "24px" }}>🏪</div>
      <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#111", margin: "0 0 12px" }}>
        Store not found
      </h1>
      <p style={{ fontSize: "16px", color: "#666", maxWidth: "360px", lineHeight: 1.7, margin: "0 0 32px" }}>
        This store doesn't exist or may have been moved.
      </p>
      <a
        href="https://pax26.com"
        style={{
          padding: "12px 28px", borderRadius: "12px",
          background: "#111", color: "#fff", fontWeight: 700,
          fontSize: "14px", textDecoration: "none",
        }}
      >
        Go to Pax26
      </a>
    </div>
  );
}
