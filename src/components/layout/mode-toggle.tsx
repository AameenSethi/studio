
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="relative overflow-hidden">
      <Sun className="h-[1.2rem] w-[1.2rem] transform text-yellow-500 transition-all duration-500 ease-in-out dark:-translate-y-8 dark:opacity-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] transform text-slate-200 opacity-0 transition-all duration-500 ease-in-out dark:translate-y-0 dark:opacity-100" style={{ transform: 'translateY(2rem)' }} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
