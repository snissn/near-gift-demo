import { v4 as uuidv4 } from "uuid"

import { createHash } from "crypto"

export function sha256(msg: string) {
  return createHash("sha256").update(msg).digest("hex")
}

export function generateIntentID(): string {
  return sha256(uuidv4())
}
