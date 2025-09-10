import type { Intent, MultiPayload } from "@defuse-protocol/contract-types"
import { safeParse } from "valibot"
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
      payload?: any
    }
    const standard = anyPayload.standard
    if (!standard) return null

    if (standard === "nep413") {
      const intents = anyPayload.payload?.message?.intents as Intent[] | undefined
      const firstIntent = intents?.[0]
      return firstIntent && isTransferIntent(firstIntent) ? firstIntent : null
    }

    if (standard === "erc191" || standard === "raw_ed25519" || standard === "webauthn") {
      const intents = anyPayload.payload?.intents as Intent[] | undefined
      const firstIntent = intents?.[0]
      return firstIntent && isTransferIntent(firstIntent) ? firstIntent : null
    }

    return null
  } catch (e) {
    logger.error(e)
    return null
  }
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
