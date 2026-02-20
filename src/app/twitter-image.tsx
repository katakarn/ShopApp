import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 600
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a, #1946c7 62%, #1a63e8)",
          color: "white",
          padding: "48px 56px"
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700 }}>ShopApp</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: "80%" }}>
          <div style={{ fontSize: 58, lineHeight: 1.08, fontWeight: 800 }}>
            E-commerce demo with premium UX/UI
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.92)" }}>
            Search, cart, checkout, orders, and admin dashboard.
          </div>
        </div>
      </div>
    ),
    size
  );
}
