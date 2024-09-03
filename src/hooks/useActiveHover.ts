"use client"

import React, { useCallback, useEffect, useState } from "react"

import { debounce } from "@src/utils/debounce"

type ReactMouseEventOrNull = React.MouseEvent<HTMLDivElement, MouseEvent> | null

export const useActiveHover = () => {
  const [isActive, setIsActive] = useState(false)
  const [event, setEvent] = useState<ReactMouseEventOrNull>(null)

  const handleMouseOver = useCallback(
    debounce((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setIsActive(true)
      setEvent(e)
    }, 50),
    []
  )

  const handleMouseLeave = useCallback(
    debounce(() => setIsActive(false), 50),
    []
  )

  useEffect(() => {
    if (isActive && event) {
      const timeoutId = setTimeout(() => {
        const elementUnderCursor = document.elementFromPoint(
          event.clientX,
          event.clientY
        )

        const targetElement = event.target as Element

        if (elementUnderCursor && !targetElement.contains(elementUnderCursor)) {
          setIsActive(false)
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isActive, event])

  return {
    isActive,
    handleMouseOver,
    handleMouseLeave,
  }
}
