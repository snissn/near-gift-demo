"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { debounce } from "@src/utils/debounce"

type ReactMouseEventOrNull = React.MouseEvent<HTMLDivElement, MouseEvent> | null

export const useActiveHover = () => {
  const [isActive, setIsActive] = useState(false)
  const eventRef = useRef<ReactMouseEventOrNull>(null)

  const handleMouseOver = useCallback(
    debounce((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setIsActive(true)
      eventRef.current = e
    }, 50),
    []
  )

  const handleMouseLeave = useCallback(
    debounce(() => setIsActive(false), 50),
    []
  )

  useEffect(() => {
    if (isActive && eventRef.current) {
      const timeoutId = setTimeout(() => {
        const elementUnderCursor = document.elementFromPoint(
          eventRef.current!.clientX,
          eventRef.current!.clientY
        )

        const targetElement = eventRef.current!.target as Element

        if (elementUnderCursor && !targetElement.contains(elementUnderCursor)) {
          setIsActive(false)
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isActive])

  return {
    isActive,
    handleMouseOver,
    handleMouseLeave,
  }
}
