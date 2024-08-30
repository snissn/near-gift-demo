import { getBitcoinBalance } from "@src/api/token"

export async function bitcoinNativeBalance(
  accountId: string
): Promise<string | null> {
  try {
    const balance = await getBitcoinBalance(accountId)
    return balance.final_balance.toString()
  } catch (e) {
    console.error("Failed to check native balance")
    return null
  }
}
