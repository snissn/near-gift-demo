const Settings = () => {
  const elementCircleStyle = "bg-black w-[3px] h-[3px] rounded-full"
  return (
    <div className="w-[35px] h-[35px] flex justify-center items-center bg-gray-200 rounded-full gap-1">
      <span className={elementCircleStyle}></span>
      <span className={elementCircleStyle}></span>
      <span className={elementCircleStyle}></span>
    </div>
  )
}

export default Settings
