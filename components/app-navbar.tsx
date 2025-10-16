"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export default function AppNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => {
    const current = theme === "system" ? systemTheme : theme
    setTheme(current === "dark" ? "light" : "dark")
  }

  // Minimal header on auth pages to reduce clutter
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register")

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-foreground hover:text-primary">
              FormsKit
            </Link>
            {!isAuthPage && (
              <div className="hidden md:flex items-center gap-4 text-sm">
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
                <Link href="/orgs" className="hover:text-primary">
                  Orgs
                </Link>
                <Link href="/swagger-docs" className="hover:text-primary">
                  Swagger
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mounted && (
              <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
                {(theme === "system" ? systemTheme : theme) === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            <Separator orientation="vertical" className="h-6" />
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/orgs">
                  <Button variant="secondary" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
