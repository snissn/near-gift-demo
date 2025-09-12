import * as Sentry from "@sentry/core"
import type { Context, Contexts } from "@sentry/types"
import {
  configureSDK,
  config as currentSDKConfig,
} from "@src/components/DefuseSDK/config"
import {
  APP_ENV,
  INTENTS_ENV,
  SOLVER_RELAY_BASE_URL,
} from "@src/utils/environment"

let hasInitialized = false

export function initSDK() {
  if (hasInitialized) {
    return
  }
  hasInitialized = true

  const envArg = SOLVER_RELAY_BASE_URL
    ? { ...currentSDKConfig.env, solverRelayBaseURL: SOLVER_RELAY_BASE_URL }
    : INTENTS_ENV

  if (APP_ENV === "development") {
    configureSDK({
      env: envArg,
      logger: {
        verbose: console.log,
        debug: console.info,
        info: console.info,
        warn: console.warn,
        error: console.error,
      },
      features: {
        hyperliquid: true,
        ton: true,
        near_intents: true,
        avalanche: true,
        sui: true,
        stellar: true,
        optimism: true,
        aptos: true,
      },
    })
  } else {
    configureSDK({
      env: envArg,
      logger: {
        verbose: (msg, data) => {
          Sentry.addBreadcrumb({
            message: msg,
            category: "defuse-sdk",
            data: data,
          })
        },
        debug: (msg, contexts) => {
          Sentry.captureMessage(msg, {
            contexts: sanitizeContexts(contexts),
            level: "debug",
          })
        },
        info: (msg, contexts) => {
          Sentry.captureMessage(msg, {
            contexts: sanitizeContexts(contexts),
            level: "info",
          })
        },
        warn: (msg, contexts) => {
          Sentry.captureMessage(msg, {
            contexts: sanitizeContexts(contexts),
            level: "warning",
          })
        },
        error: (err, contexts) => {
          Sentry.captureException(err, { contexts: sanitizeContexts(contexts) })
        },
      },
      features: {
        hyperliquid: true,
        ton: true,
        near_intents: true,
        sui: true,
        optimism: true,
        avalanche: true,
        stellar: true,
        aptos: true,
      },
    })
  }
}

function isContext(value: unknown): value is Context {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

// Utility to sanitize contexts for Sentry
function sanitizeContexts(
  contexts: Record<string, unknown> | undefined
): Contexts | undefined {
  if (!contexts) return undefined
  const sanitized: Contexts = {}
  for (const key in contexts) {
    const value = contexts[key]
    if (isContext(value)) {
      sanitized[key] = value
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}
