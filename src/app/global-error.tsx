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
          background: "#FAF7F2",
          color: "#1E1714",
          fontFamily: "Didot, 'Bodoni 72', Georgia, serif",
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
              color: "#6B5F57",
              margin: 0,
            }}
          >
            Seiko Almanac
          </p>
          <h1 style={{ fontSize: "2.4rem", margin: "0.6rem 0 0", fontWeight: 400 }}>
            Something stopped the watch.
          </h1>
          <p style={{ color: "#574B44", marginTop: "0.75rem" }}>An unexpected error occurred.</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.6rem",
              padding: "0.65rem 1.5rem",
              borderRadius: 0,
              border: "1px solid #490B18",
              background: "#490B18",
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
