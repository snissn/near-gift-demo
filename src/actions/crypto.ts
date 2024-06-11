"use server"

import { createHash } from "crypto"

export async function sha256(msg: string) {
  return createHash("sha256").update(msg).digest("hex")
}
