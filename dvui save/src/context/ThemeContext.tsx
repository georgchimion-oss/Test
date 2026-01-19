import { createContext, useContext, useState, ReactNode } from 'react'

export type ThemeType =
  | 'pwc'
  | 'nineties'
  | 'miami'
  | 'bulls'
  | 'france'
  | 'paris'
  | 'psg'
  | 'matrix'
  | 'barbie'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'lakers'
  | 'cyberpunk'
  | 'retro'

export interface ThemeConfig {
  name: string
  emoji: string
  bgMain: string
  cardBg: string
  cardBorder: string
  textPrimary: string
  textSecondary: string
  primary: string
  accent1?: string
  accent2?: string
  accent3?: string
  accent4?: string
  statusColors?: {
    completed: string
    inProgress: string
    atRisk: string
    blocked: string
    notStarted: string
  }
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  pwc: {
    name: 'PwC Light',
    emoji: '',
    bgMain: 'linear-gradient(180deg, #f5f7fb 0%, #ffffff 60%)',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    primary: '#D04A02',
    accent1: '#E88D14',
    accent2: '#DB4E18',
    accent3: '#0f172a',
    accent4: '#b91c1c',
    statusColors: {
      completed: '#059669',
      inProgress: '#f59e0b',
      atRisk: '#b91c1c',
      blocked: '#64748b',
      notStarted: '#94a3b8',
    }
  },
  nineties: {
    name: '90s Neon',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #fde68a 0%, #bae6fd 45%, #f5d0fe 100%)',
    cardBg: '#ffffff',
    cardBorder: '#f9a8d4',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    primary: '#ec4899',
    accent1: '#22d3ee',
    accent2: '#a855f7',
    accent3: '#f97316',
    accent4: '#0ea5e9',
  },
  miami: {
    name: 'Miami Vice',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #ffe4e6 0%, #cffafe 50%, #fde68a 100%)',
    cardBg: '#ffffff',
    cardBorder: '#fbcfe8',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    primary: '#06b6d4',
    accent1: '#f97316',
    accent2: '#ec4899',
    accent3: '#0ea5e9',
    accent4: '#facc15',
  },
  bulls: {
    name: 'Chicago Bulls',
    emoji: '',
    bgMain: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 65%)',
    cardBg: '#ffffff',
    cardBorder: '#fee2e2',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    primary: '#b91c1c',
    accent1: '#111827',
    accent2: '#ef4444',
    accent3: '#f97316',
    accent4: '#b91c1c',
  },
  france: {
    name: 'Vive la France!',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #002395 0%, #ffffff 50%, #ED2939 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#002395',
    textPrimary: '#002395',
    textSecondary: '#4b5563',
    primary: '#002395',
    accent1: '#ED2939',
    accent2: '#ffffff',
    accent3: '#002395',
    accent4: '#ED2939',
  },
  paris: {
    name: 'Paris Mon Amour',
    emoji: '',
    bgMain: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 30%, #f5e6d3 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: '#f9a8d4',
    textPrimary: '#831843',
    textSecondary: '#9d174d',
    primary: '#be185d',
    accent1: '#c4b5a0',
    accent2: '#f472b6',
    accent3: '#831843',
    accent4: '#fbbf24',
  },
  psg: {
    name: 'Paris Saint-Germain',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #004170 0%, #0a0a23 50%, #DA291C 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#004170',
    textPrimary: '#004170',
    textSecondary: '#1e3a5f',
    primary: '#004170',
    accent1: '#DA291C',
    accent2: '#ffffff',
    accent3: '#004170',
    accent4: '#DA291C',
  },
  matrix: {
    name: 'The Matrix',
    emoji: '',
    bgMain: 'linear-gradient(180deg, #0a0a0a 0%, #001a00 100%)',
    cardBg: 'rgba(0, 30, 0, 0.9)',
    cardBorder: '#00ff00',
    textPrimary: '#00ff00',
    textSecondary: '#00aa00',
    primary: '#00ff00',
    accent1: '#003300',
    accent2: '#00ff00',
    accent3: '#00cc00',
    accent4: '#00ff00',
  },
  barbie: {
    name: 'Barbie World',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #ff69b4 0%, #ffb6c1 50%, #ff1493 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#ff69b4',
    textPrimary: '#c71585',
    textSecondary: '#db2777',
    primary: '#ec4899',
    accent1: '#f472b6',
    accent2: '#ffffff',
    accent3: '#ff69b4',
    accent4: '#c026d3',
  },
  ocean: {
    name: 'Deep Ocean',
    emoji: '',
    bgMain: 'linear-gradient(180deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#0ea5e9',
    textPrimary: '#0c4a6e',
    textSecondary: '#0369a1',
    primary: '#0284c7',
    accent1: '#22d3ee',
    accent2: '#06b6d4',
    accent3: '#0891b2',
    accent4: '#14b8a6',
  },
  sunset: {
    name: 'California Sunset',
    emoji: '',
    bgMain: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 20%, #fdba74 50%, #f97316 80%, #ea580c 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#fdba74',
    textPrimary: '#9a3412',
    textSecondary: '#c2410c',
    primary: '#f97316',
    accent1: '#fbbf24',
    accent2: '#f59e0b',
    accent3: '#ea580c',
    accent4: '#dc2626',
  },
  forest: {
    name: 'Enchanted Forest',
    emoji: '',
    bgMain: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 60%, #6ee7b7 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#34d399',
    textPrimary: '#064e3b',
    textSecondary: '#047857',
    primary: '#059669',
    accent1: '#34d399',
    accent2: '#10b981',
    accent3: '#047857',
    accent4: '#065f46',
  },
  lakers: {
    name: 'LA Lakers',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #552583 0%, #FDB927 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#552583',
    textPrimary: '#552583',
    textSecondary: '#7c3aed',
    primary: '#552583',
    accent1: '#FDB927',
    accent2: '#a855f7',
    accent3: '#552583',
    accent4: '#FDB927',
  },
  cyberpunk: {
    name: 'Cyberpunk 2077',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    cardBg: 'rgba(26, 26, 46, 0.95)',
    cardBorder: '#00f0ff',
    textPrimary: '#00f0ff',
    textSecondary: '#ff00ff',
    primary: '#00f0ff',
    accent1: '#ff00ff',
    accent2: '#ffff00',
    accent3: '#00ff00',
    accent4: '#ff0080',
  },
  retro: {
    name: 'Retro Arcade',
    emoji: '',
    bgMain: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
    cardBg: 'rgba(0, 0, 0, 0.8)',
    cardBorder: '#ff6b6b',
    textPrimary: '#feca57',
    textSecondary: '#ff9ff3',
    primary: '#ff6b6b',
    accent1: '#48dbfb',
    accent2: '#ff9ff3',
    accent3: '#1dd1a1',
    accent4: '#feca57',
  },
}

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  currentTheme: ThemeConfig
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('app-theme')
    return (saved as ThemeType) || 'pwc'
  })

  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme)
    localStorage.setItem('app-theme', newTheme)
  }

  const currentTheme = THEMES[theme]

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
