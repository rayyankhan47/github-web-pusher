import type { ReactElement } from "react";

export function PopupApp(): ReactElement {
  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 16, minWidth: 320 }}>
      <h1 style={{ fontSize: 18, margin: 0 }}>GitHub Web Pusher</h1>
      <p style={{ marginTop: 8, marginBottom: 0 }}>
        Popup UI scaffold is ready. Capture controls and push flow will be added in later steps.
      </p>
    </main>
  );
}
