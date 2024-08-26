import axios, { AxiosResponse } from "axios"

import { Result } from "@src/types/interfaces"
import { SolverTokenList } from "@src/libs/de-sdk/providers/solver0Provider"

const SOLVER_RELAY_0_URL = process.env.SOLVER_RELAY_0_URL ?? ""

export const getDiscoverDefuseAssets = (
  address: string
): Promise<Result<SolverTokenList>> =>
  axios
    .post(SOLVER_RELAY_0_URL, {
      jsonrpc: "2.0",
      id: "dontcare",
      method: "discover_defuse_assets",
      params: [address],
    })
    .then((resp) => resp.data)
