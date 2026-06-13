"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#F6F5F1",
          color: "#1C1814",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              color: "#8C6C39",
              margin: 0,
            }}
          >
            Seiko Almanac
          </p>
          <h1 style={{ fontSize: "2.4rem", margin: "0.6rem 0 0", fontWeight: 400 }}>
            Something stopped the watch.
          </h1>
          <p style={{ color: "#645B50", marginTop: "0.75rem" }}>An unexpected error occurred.</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.6rem",
              padding: "0.65rem 1.5rem",
              borderRadius: 8,
              border: "1px solid #4D0E1C",
              background: "#4D0E1C",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
