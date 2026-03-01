import type { CapturePayload, Candidate, PushRequest, PushResult } from "./models";

export type MessageType =
  | "health.ping"
  | "capture.detect"
  | "capture.confirm"
  | "push.execute";

export interface MessageMap {
  "health.ping": {
    request: { source: "popup" | "content" | "options" };
    response: { ok: true; nowIso: string };
  };
  "capture.detect": {
    request: { tabId: number };
    response: { candidates: Candidate[] };
  };
  "capture.confirm": {
    request: { payload: CapturePayload };
    response: { accepted: boolean };
  };
  "push.execute": {
    request: { request: PushRequest };
    response: PushResult;
  };
}

export interface MessageEnvelope<TType extends MessageType> {
  type: TType;
  requestId: string;
  payload: MessageMap[TType]["request"];
}

export interface MessageSuccessEnvelope<TType extends MessageType> {
  requestId: string;
  ok: true;
  payload: MessageMap[TType]["response"];
}

export interface MessageErrorEnvelope {
  requestId: string;
  ok: false;
  error: string;
  code?: string;
}

export type MessageResponse<TType extends MessageType> =
  | MessageSuccessEnvelope<TType>
  | MessageErrorEnvelope;
