import { ImageResponse } from "next/og";

export const alt = "Mukhtada Billah NST — Fullstack, AI, and data research portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#eaddc0",
          color: "#16241f",
          padding: "54px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "5px solid #16241f",
            boxShadow: "14px 14px 0 #16241f",
            padding: "52px 58px",
            background: "#f5ecd8",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                fontFamily: "monospace",
                fontSize: 22,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: 16, height: 16, background: "#ecb63f", display: "flex" }} />
              Player portfolio
            </div>
            <div
              style={{
                display: "flex",
                border: "3px solid #16241f",
                padding: "10px 16px",
                fontFamily: "monospace",
                fontSize: 18,
                letterSpacing: 2,
              }}
            >
              JAMBI · ID
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
            <div
              style={{
                display: "flex",
                color: "#b8492b",
                fontFamily: "monospace",
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              // SYSTEMS BUILDER
            </div>
            <div style={{ display: "flex", fontSize: 76, lineHeight: 1.02, letterSpacing: -2 }}>
              Mukhtada Billah NST
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontFamily: "sans-serif",
                fontSize: 29,
                color: "#47584f",
              }}
            >
              Fullstack builder · AI tinkerer · data researcher
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "monospace", fontSize: 19 }}>
            <span style={{ width: 120, height: 8, background: "#45b8a4", display: "flex" }} />
            UNIVERSITAS JAMBI · SISTEM INFORMASI
          </div>
        </div>
      </div>
    ),
    size,
  );
}
