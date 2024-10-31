export async function sha256(msg: string) {
  // Convert the message string to an array of bytes
  const msgBuffer = new TextEncoder().encode(msg)

  // Generate the hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)

  // Convert the hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

export function generateIntentID(): Promise<string> {
  return sha256(crypto.randomUUID())
}
