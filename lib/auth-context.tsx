"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'OFFICER'
  studentId?: string
  officerId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, role: 'STUDENT' | 'OFFICER') => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, role: 'STUDENT' | 'OFFICER'): Promise<boolean> => {
    try {
      setIsLoading(true)

      if (role === 'STUDENT') {
        // Find student by email
        const response = await fetch(`/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: 'STUDENT' })
        })

        if (response.ok) {
          const data = await response.json()
          const userData: User = {
            id: data.student.id,
            name: data.student.name,
            email: data.student.email,
            role: 'STUDENT',
            studentId: data.student.id
          }
          setUser(userData)
          localStorage.setItem('currentUser', JSON.stringify(userData))
          return true
        }
      } else if (role === 'OFFICER') {
        // Find officer by email
        const response = await fetch(`/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: 'OFFICER' })
        })

        if (response.ok) {
          const data = await response.json()
          const userData: User = {
            id: data.officer.id,
            name: data.officer.name,
            email: data.officer.email,
            role: 'OFFICER',
            officerId: data.officer.id
          }
          setUser(userData)
          localStorage.setItem('currentUser', JSON.stringify(userData))
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
