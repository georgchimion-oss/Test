import { LayoutGrid, Table, Kanban, Calendar } from 'lucide-react'

export type ViewType = 'cards' | 'table' | 'kanban' | 'timeline'

interface ViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  variant?: 'default' | 'pwc'
}

export default function ViewSwitcher({ currentView, onViewChange, variant = 'default' }: ViewSwitcherProps) {
  const views = [
    { id: 'cards' as ViewType, label: 'Cards', icon: LayoutGrid },
    { id: 'table' as ViewType, label: 'Table', icon: Table },
    { id: 'kanban' as ViewType, label: 'Board', icon: Kanban },
    { id: 'timeline' as ViewType, label: 'Timeline', icon: Calendar },
  ]

  const containerClass = variant === 'pwc' ? 'pwc-view-tabs' : 'monday-view-tabs'
  const tabClass = variant === 'pwc' ? 'pwc-view-tab' : 'monday-view-tab'

  return (
    <div className={containerClass}>
      {views.map((view) => {
        const Icon = view.icon
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`${tabClass} ${currentView === view.id ? 'active' : ''}`}
          >
            <Icon size={16} />
            {view.label}
          </button>
        )
      })}
    </div>
  )
}
