import type { ReactElement } from "react";

export function OptionsApp(): ReactElement {
  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>GitHub Web Pusher - Options</h1>
      <p style={{ marginBottom: 0 }}>
        Options UI scaffold is ready. Authentication, defaults, and mapping settings will be
        implemented in upcoming steps.
      </p>
    </main>
  );
}
