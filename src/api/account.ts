import axios from "axios"

const NEAR_NODE_URL = process.env.nearNodeUrl ?? "https://rpc.mainnet.near.org"

export const getViewAccount = (accountId: string | null) =>
  axios
    .post(NEAR_NODE_URL, {
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      },
    })
    .then((resp) => resp.data)
