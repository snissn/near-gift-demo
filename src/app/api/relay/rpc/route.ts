import { config } from "@src/components/DefuseSDK/config"
import { logger } from "@src/utils/logger"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const targetBase = config.env.solverRelayBaseURL
    const incomingUrl = new URL(request.url)
    const target = new URL("rpc", targetBase)
    // Preserve query params like method=publish_intents
    for (const [k, v] of incomingUrl.searchParams) target.searchParams.set(k, v)

    const body = await request.json().catch(() => ({}))
    const t0 = performance.now()
    logger.info("Proxy POST /api/relay/rpc -> solver relay", {
      relay: {
        target: target.toString(),
        method: incomingUrl.searchParams.get("method"),
      },
    })

    const resp = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await resp.text()

    logger.info("Proxy /api/relay/rpc response", {
      relay: { status: resp.status, ms: Math.round(performance.now() - t0) },
    })

    return new NextResponse(text, {
      status: resp.status,
      headers: {
        "Content-Type": resp.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (err) {
    logger.error(err)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}
