import { useEffect, useRef, useLayoutEffect } from "react"

export default function useClickAway(cb: (e: MouseEvent | TouchEvent) => void) {
  const ref = useRef<HTMLDivElement>(null)
  const refCb = useRef(cb)

  useLayoutEffect(() => {
    refCb.current = cb
  })

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const element = ref.current
      if (element && e.target && !element.contains(e.target as Node)) {
        refCb.current(e)
      }
    }

    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)

    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [])

  return ref
}
