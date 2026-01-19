import { useEffect, type ReactNode } from 'react'
import { initialize } from '@microsoft/power-apps/app'

interface PowerProviderProps {
  children: ReactNode
}

export function PowerProvider({ children }: PowerProviderProps) {
  useEffect(() => {
    const init = async () => {
      try {
        await initialize()
        console.log('Power Apps SDK initialized')
      } catch (error) {
        console.error('Failed to initialize Power Apps SDK:', error)
      }
    }
    void init()
  }, [])

  return <>{children}</>
}
