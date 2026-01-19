import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import type { UserSession } from '../types'
import { logAudit } from '../data/auditLayer'
import { getStaff, onDataRefresh, syncDataverseData } from '../data/dataLayer'

interface PowerAppsContext {
  user?: {
    fullName?: string
    userPrincipalName?: string
  }
}

interface AuthContextType {
  currentUser: UserSession | null
  login: (userId: string) => void
  loginWithMicrosoft: () => Promise<void>
  logout: () => void
  isAdmin: boolean
  isManager: boolean
  isSsoEnabled: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const isSsoEnabled = false

  useEffect(() => {
    let isActive = true

    const loadCurrentUser = async () => {
      let email = ''
      let name = ''

      try {
        const context = (await getContext()) as PowerAppsContext
        email = context.user?.userPrincipalName || ''
        name = context.user?.fullName || email.split('@')[0] || ''
      } catch (error) {
        console.warn('Power Apps context not available:', error)
      }

      await syncDataverseData()
      if (!isActive) return

      const staff = getStaff()
      const matchedUser = email
        ? staff.find((s) => s.email.toLowerCase() === email.toLowerCase())
        : null

      if (matchedUser) {
        const session: UserSession = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          title: matchedUser.title,
          userRole: matchedUser.userRole,
          supervisorId: matchedUser.supervisorId,
          workstreamIds: matchedUser.workstreamIds,
        }
        setCurrentUser(session)
        localStorage.setItem('currentUser', JSON.stringify(session))
        logAudit(session.id, session.name, 'Login', 'App', undefined, 'User logged in')
        return
      }

      if (email || name) {
        const session: UserSession = {
          id: email || name,
          name: name || email,
          email: email,
          title: 'Associate',
          userRole: 'User',
          workstreamIds: [],
        }
        setCurrentUser(session)
        localStorage.setItem('currentUser', JSON.stringify(session))
        logAudit(session.id, session.name, 'Login', 'App', undefined, 'User logged in')
      }
    }

    void loadCurrentUser()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    return onDataRefresh(() => {
      if (!currentUser?.email) return
      const staff = getStaff()
      const matchedUser = staff.find((s) => s.email.toLowerCase() === currentUser.email.toLowerCase())
      if (!matchedUser) return

      const session: UserSession = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        title: matchedUser.title,
        userRole: matchedUser.userRole,
        supervisorId: matchedUser.supervisorId,
        workstreamIds: matchedUser.workstreamIds,
      }

      setCurrentUser(session)
      localStorage.setItem('currentUser', JSON.stringify(session))
    })
  }, [currentUser?.email])

  const login = (userId: string) => {
    const staff = getStaff()
    const user = staff.find((s) => s.id === userId)

    if (user) {
      const session: UserSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title,
        userRole: user.userRole,
        supervisorId: user.supervisorId,
        workstreamIds: user.workstreamIds,
      }
      setCurrentUser(session)
      localStorage.setItem('currentUser', JSON.stringify(session))
      logAudit(session.id, session.name, 'Login', 'App', undefined, 'User logged in')
    }
  }

  const loginWithMicrosoft = async () => {
    throw new Error('SSO is not enabled for this code app.')
  }

  const logout = () => {
    if (currentUser) {
      logAudit(currentUser.id, currentUser.name, 'Logout', 'App', undefined, 'User logged out')
    }
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const isAdmin = currentUser?.userRole === 'Admin'
  const isManager = currentUser?.userRole === 'Admin' || currentUser?.userRole === 'Manager'

  return (
    <AuthContext.Provider value={{ currentUser, login, loginWithMicrosoft, logout, isAdmin, isManager, isSsoEnabled }}>
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
