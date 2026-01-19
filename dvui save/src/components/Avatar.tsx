import type { Staff } from '../types'

interface AvatarProps {
  user: Staff | { name: string }
  size?: number
}

// Generate consistent color from name
function getColorFromName(name: string): string {
  const colors = [
    '#0073EA', // Monday blue
    '#00CA72', // Monday green
    '#FDAB3D', // Monday orange
    '#E44258', // Monday red
    '#9D99B9', // Purple
    '#FF6AC1', // Pink
    '#00C8D3', // Cyan
    '#FF7575', // Light red
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export default function Avatar({ user, size = 32 }: AvatarProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: getColorFromName(user.name),
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
      }}
      title={user.name}
    >
      {initials}
    </div>
  )
}
