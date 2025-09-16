export interface Gift {
  giftId: string
  encryptedPayload: string
  pKey: string | null
  iv: string | null
  imageCid?: string | null
}

export type CreateGiftRequest = {
  gift_id: string
  encrypted_payload: string
  p_key: string
  image_cid?: string | null
}

export interface CreateGiftResponse {
  success: boolean
}

export interface GetGiftResponse {
  encrypted_payload: string
  p_key: string | null
  image_cid?: string | null
}

export interface ErrorResponse {
  error: string | object
}
