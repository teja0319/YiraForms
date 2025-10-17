"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type AuthUser = {
  id: string
  email: string
  // ... add more if your API returns them
}

type LoginResult = { token: string; user?: AuthUser }
type RegisterResult = { token: string; user?: AuthUser }

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null)

export function useAuth() {
  // This prevents localStorage access during server-side rendering
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(getToken())
  }, [])

  const isAuthenticated = !!token

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error("Login failed")
    const data = (await res.json()) as LoginResult
    localStorage.setItem("auth_token", data.token)
    setToken(data.token)
    return data
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error("Register failed")
    const data = (await res.json()) as RegisterResult
    localStorage.setItem("auth_token", data.token)
    setToken(data.token)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token")
    setToken(null)
  }, [])

  return useMemo(
    () => ({ token, isAuthenticated, login, register, logout }),
    [token, isAuthenticated, login, register, logout],
  )
}
