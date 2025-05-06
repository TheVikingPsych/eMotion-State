"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function ThemeForceRefresh() {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    // Force a theme refresh by briefly switching themes
    const currentTheme = theme
    if (currentTheme) {
      const tempTheme = currentTheme === "dark" ? "light" : "dark"
      setTheme(tempTheme)
      setTimeout(() => {
        setTheme(currentTheme)
      }, 10)
    }
  }, [])

  return null
}
