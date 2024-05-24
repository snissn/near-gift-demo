/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    auroraChainId: process.env.auroraChainId,
    nearChainId: process.env.NEAR_CAHIN_ID,
    ethChainId: process.env.ETH_CHAIN_ID,
    baseChainId: process.env.BASE_CHAIN_ID,
  },
}

export default nextConfig
