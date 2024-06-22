import { Text } from "@radix-ui/themes"

import Button from "@src/components/Button/Button"

const Interested = () => {
  return (
    <div className="flex flex-col gap-5 justify-center items-center w-full min-h-[420px] py-8 px-16 shadow-card-multi rounded-[40px] mb-[96px] md:mb-[128px]">
      <Text className="text-5xl font-black">Interested in Defuse?</Text>
      <Text size="5" weight="bold" className="max-w-[558px] text-gray-600">
        Connect with us to explore how Defuse is revolutionizing multichain
        financial products and how you can be a part of this groundbreaking
        journey.
      </Text>
      <div className="w-full flex justify-center items-center gap-5">
        <Button variant="solid">Contact us</Button>
        <Button variant="secondary">Subscribe to updates</Button>
      </div>
    </div>
  )
}

export default Interested
