import { AppError } from "./errors";
import type { MessageEnvelope, MessageMap, MessageResponse, MessageType } from "./messages";

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_RETRIES = 1;

export interface SendMessageOptions {
  timeoutMs?: number;
  retries?: number;
}

function buildEnvelope<TType extends MessageType>(
  type: TType,
  payload: MessageMap[TType]["request"]
): MessageEnvelope<TType> {
  return {
    type,
    requestId: crypto.randomUUID(),
    payload
  };
}

function sendEnvelope<TType extends MessageType>(
  envelope: MessageEnvelope<TType>,
  timeoutMs: number
): Promise<MessageMap[TType]["response"]> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new AppError(`Message timeout for ${envelope.type}`, "MESSAGE_TIMEOUT"));
    }, timeoutMs);

    chrome.runtime.sendMessage(envelope, (rawResponse: MessageResponse<TType> | undefined) => {
      clearTimeout(timeout);

      if (chrome.runtime.lastError) {
        const runtimeMessage = chrome.runtime.lastError.message ?? "Runtime sendMessage failed.";
        reject(new AppError(runtimeMessage, "RUNTIME_SEND_FAILED"));
        return;
      }

      if (!rawResponse) {
        reject(new AppError(`No response for ${envelope.type}`, "EMPTY_MESSAGE_RESPONSE"));
        return;
      }

      if (!rawResponse.ok) {
        reject(new AppError(rawResponse.error, rawResponse.code ?? "MESSAGE_FAILED"));
        return;
      }

      resolve(rawResponse.payload);
    });
  });
}

export async function sendMessage<TType extends MessageType>(
  type: TType,
  payload: MessageMap[TType]["request"],
  options: SendMessageOptions = {}
): Promise<MessageMap[TType]["response"]> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const envelope = buildEnvelope(type, payload);

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await sendEnvelope(envelope, timeoutMs);
    } catch (error) {
      lastError = error;
      attempt += 1;
    }
  }

  throw lastError;
}
