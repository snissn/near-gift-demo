import type { EmptyTokenBalance } from "@src/app/wallet/page"
import CardToken from "@src/app/wallet/CardToken"
import type { NetworkTokenWithSwapRoute } from "@src/types/interfaces"

type Props = {
  list: NetworkTokenWithSwapRoute[] | EmptyTokenBalance[]
}
const CardTokenList = ({ list }: Props) => {
  return (
    <div className="flex flex-col gap-2.5">
      {list.map((tokenProps, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <reason>
        <CardToken key={i} {...tokenProps} />
      ))}
    </div>
  )
}

export default CardTokenList
