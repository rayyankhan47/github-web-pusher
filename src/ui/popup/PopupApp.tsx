import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import { sendMessage } from "../../shared/messageClient";

export function PopupApp(): ReactElement {
  const [health, setHealth] = useState<string>("Checking background...");

  useEffect(() => {
    void sendMessage("health.ping", { source: "popup" })
      .then((response) => {
        setHealth(`Background online (${response.nowIso})`);
      })
      .catch(() => {
        setHealth("Background unavailable");
      });
  }, []);

  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 16, minWidth: 320 }}>
      <h1 style={{ fontSize: 18, margin: 0 }}>GitHub Web Pusher</h1>
      <p style={{ marginTop: 8, marginBottom: 0 }}>
        Popup UI scaffold is ready. Capture controls and push flow will be added in later steps.
      </p>
      <p style={{ marginTop: 8, marginBottom: 0, fontSize: 13, opacity: 0.8 }}>{health}</p>
    </main>
  );
}
