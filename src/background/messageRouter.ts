import { AppError, errorMessage } from "../shared/errors";
import { hasKey, isObject, isString } from "../shared/guards";
import { log } from "../shared/logger";
import type {
  MessageEnvelope,
  MessageErrorEnvelope,
  MessageMap,
  MessageResponse,
  MessageSuccessEnvelope,
  MessageType
} from "../shared/messages";
import type { Candidate } from "../shared/models";

type MessageHandler<TType extends MessageType> = (
  payload: MessageMap[TType]["request"]
) => Promise<MessageMap[TType]["response"]> | MessageMap[TType]["response"];

type HandlerMap = { [TType in MessageType]: MessageHandler<TType> };

const handlers: HandlerMap = {
  "health.ping": () => ({
    ok: true,
    nowIso: new Date().toISOString()
  }),
  "capture.detect": () => ({ candidates: [] as Candidate[] }),
  "capture.confirm": () => ({ accepted: true }),
  "push.execute": async () => {
    throw new AppError("Push flow is not implemented yet.", "PUSH_NOT_IMPLEMENTED");
  }
};

function isMessageType(value: unknown): value is MessageType {
  return (
    value === "health.ping" ||
    value === "capture.detect" ||
    value === "capture.confirm" ||
    value === "push.execute"
  );
}

function isEnvelope(value: unknown): value is MessageEnvelope<MessageType> {
  return (
    isObject(value) &&
    hasKey(value, "type") &&
    hasKey(value, "requestId") &&
    hasKey(value, "payload") &&
    isMessageType(value.type) &&
    isString(value.requestId)
  );
}

function okResponse<TType extends MessageType>(
  requestId: string,
  payload: MessageMap[TType]["response"]
): MessageSuccessEnvelope<TType> {
  return {
    requestId,
    ok: true,
    payload
  };
}

function errorResponse(requestId: string, error: unknown): MessageErrorEnvelope {
  const message = errorMessage(error);
  const code = error instanceof AppError ? error.code : "MESSAGE_HANDLER_ERROR";

  return {
    requestId,
    ok: false,
    error: message,
    code
  };
}

export function registerMessageRouter(): void {
  chrome.runtime.onMessage.addListener(
    (
      incoming: unknown,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: MessageResponse<MessageType>) => void
    ) => {
      if (!isEnvelope(incoming)) {
        return false;
      }

      const handler = handlers[incoming.type] as MessageHandler<MessageType>;

      Promise.resolve(handler(incoming.payload))
        .then((result) => {
          sendResponse(okResponse(incoming.requestId, result));
        })
        .catch((error: unknown) => {
          log("error", "Message handler failed.", "messageRouter", error);
          sendResponse(errorResponse(incoming.requestId, error));
        });

      return true;
    }
  );
}
