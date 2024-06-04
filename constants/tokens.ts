enum TOKENS_MAINNET {
  NEAR = "",
  AURORA = "aurora.mainnet",
  REF = "ref.mainnet",
  USDt = "usdtt.mainnet",
}

enum TOKENS_TESTNET {
  NEAR = "",
  AURORA = "aurora.fakes.testnet",
  REF = "ref.fakes.testnet",
  USDt = "usdtt.fakes.testnet",
}

const environment = process.env.environment || "production"
export const SUPPORTED_TOKENS: typeof TOKENS_MAINNET | typeof TOKENS_TESTNET =
  environment === "development" ? TOKENS_TESTNET : TOKENS_MAINNET

export type TokenEnum = typeof TOKENS_MAINNET | typeof TOKENS_TESTNET

export type TOKEN = {
  decimals: number
  symbol: string
  contract: TokenEnum
}

export type Token = {
  [key in keyof TokenEnum]: {
    decimals: number
    symbol: string
    contract: TokenEnum[key]
  }
}

export const TOKENS: Token = {
  NEAR: {
    decimals: 24,
    symbol: "NEAR",
    contract: SUPPORTED_TOKENS.NEAR,
  },
  AURORA: {
    decimals: 18,
    symbol: "AURORA",
    contract: SUPPORTED_TOKENS.AURORA,
  },
  REF: {
    decimals: 18,
    symbol: "REF",
    contract: SUPPORTED_TOKENS.REF,
  },
  USDt: {
    decimals: 6,
    symbol: "USDt",
    contract: SUPPORTED_TOKENS.USDt,
  },
}
