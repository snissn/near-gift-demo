type Props = {
  onClick: () => void
}

const Switch = ({ onClick }: Props) => {
  return <button onClick={onClick}>Switch</button>
}

export default Switch
