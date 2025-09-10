import { APP_ENV, BASE_URL } from "@src/utils/environment"
import type {
  CreateGiftRequest,
  CreateGiftResponse,
  ErrorResponse,
  GetGiftResponse,
} from "../types/giftTypes"

export async function createGift(request: CreateGiftRequest) {
  const response = await fetch(`${BASE_URL}/api/gifts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    await handleApiError(response, "Failed to request Gift")
  }

  return response.json() as Promise<CreateGiftResponse>
}

export async function getGift(tradeId: string) {
  const response = await fetch(`${BASE_URL}/api/gifts/${tradeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    await handleApiError(response, "Failed to verify Gift")
  }

  return response.json() as Promise<GetGiftResponse>
}

async function handleApiError(response: Response, fallbackMessage: string) {
  try {
    const error = (await response.json()) as ErrorResponse
    if (typeof error.error === "string") {
      throw new Error(error.error)
    }
    // When error is an object, include details in development to aid debugging
    if (APP_ENV === "development") {
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error.error)}`
      )
    }
    throw new Error(fallbackMessage)
  } catch {
    // Non-JSON or empty response body; fall back to generic message
    throw new Error(fallbackMessage)
  }
}
