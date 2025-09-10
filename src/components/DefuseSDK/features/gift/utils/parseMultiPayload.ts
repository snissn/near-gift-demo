import type { Intent, MultiPayload } from "@defuse-protocol/contract-types"
import { logger } from "../../../logger"

type TransferIntentSubset = {
  intent: "transfer"
  receiver_id: string
  tokens: {
    [k: string]: string
  }
}

export function parseMultiPayloadTransferMessage(
  multiPayload: MultiPayload
): null | TransferIntentSubset {
  try {
    const anyPayload = multiPayload as unknown as {
      standard?: string
      payload?: unknown
    }
    const standard = anyPayload.standard
    if (!standard) return null

    // Try standard-specific known shapes first
    let intents: Intent[] | undefined
    if (standard === "nep413") {
      intents = anyPayload.payload?.message?.intents as Intent[] | undefined
    } else if (
      standard === "erc191" ||
      standard === "raw_ed25519" ||
      standard === "webauthn"
    ) {
      intents = anyPayload.payload?.intents as Intent[] | undefined
    }

    // Fallback: try alternate nesting patterns found in older/newer payloads
    if (!intents) {
      intents = findIntents(anyPayload.payload)
    }

    const firstIntent = intents?.[0]
    return firstIntent && isTransferIntent(firstIntent) ? firstIntent : null
  } catch (e) {
    logger.error(e)
    return null
  }
}

function findIntents(payload: unknown): Intent[] | undefined {
  if (!payload || typeof payload !== "object") return undefined
  const obj = payload as Record<string, unknown>
  // Direct
  const direct = obj.intents
  if (Array.isArray(direct)) return direct as Intent[]
  // Under message
  const message = obj.message
  if (message && typeof message === "object") {
    const intents = (message as Record<string, unknown>).intents
    if (Array.isArray(intents)) return intents as Intent[]
  }
  // Under nested payload/message combinations
  const nestedPayload = obj.payload
  if (nestedPayload && typeof nestedPayload === "object") {
    const np = nestedPayload as Record<string, unknown>
    const intents = np.intents
    if (Array.isArray(intents)) return intents as Intent[]
    const msg2 = np.message
    if (msg2 && typeof msg2 === "object") {
      const intents2 = (msg2 as Record<string, unknown>).intents
      if (Array.isArray(intents2)) return intents2 as Intent[]
    }
  }
  // Shallow search in first-level object values
  for (const value of Object.values(obj)) {
    const found = findIntents(value)
    if (found) return found
  }
  return undefined
}

function isTransferIntent(intent: Intent): intent is TransferIntentSubset {
  return (
    intent.intent === "transfer" &&
    "receiver_id" in intent &&
    "tokens" in intent
  )
}

export function getTokenDiffFromTransferMessage(
  message: TransferIntentSubset
): null | Record<string, bigint> {
  if (message.intent !== "transfer") {
    return null
  }

  return Object.fromEntries(
    Object.entries(message.tokens).map(([token, amount]) => [
      token,
      BigInt(amount),
    ])
  )
}
