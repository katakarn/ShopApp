import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.26), transparent 36%), linear-gradient(135deg, #0f172a, #1b4fd8 55%, #245de9)",
          color: "white",
          padding: "56px 64px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 30,
            fontWeight: 700
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #ffffff, #d7e4ff)"
            }}
          />
          ShopApp
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: "78%" }}>
          <div style={{ fontSize: 66, lineHeight: 1.06, fontWeight: 800 }}>
            Curated products, smoother shopping flow
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.9)" }}>
            Catalog, cart, checkout, order tracking, and admin in one polished demo.
          </div>
        </div>
      </div>
    ),
    size
  );
}
