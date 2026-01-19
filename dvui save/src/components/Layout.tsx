import { useState, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Trello,
  Calendar,
  FileText,
  Users,
  Layers,
  Menu,
  X,
  LogOut,
  Shield,
  Umbrella,
  Clock,
  Network,
  BarChart3,
  Zap,
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  title: string
}

export default function Layout({ children, title }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { currentUser, logout } = useAuth()

  return (
    <div className="app">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">ProjectGov</div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem', minWidth: 'auto' }}
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>
        <nav>
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/" className="nav-link">
                <LayoutDashboard className="nav-icon" />
                <span className="nav-text">My Work</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/kanban" className="nav-link">
                <Trello className="nav-icon" />
                <span className="nav-text">Kanban Board</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/gantt" className="nav-link">
                <Calendar className="nav-icon" />
                <span className="nav-text">Gantt Chart</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/deliverables" className="nav-link">
                <FileText className="nav-icon" />
                <span className="nav-text">Deliverables</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/staff" className="nav-link">
                <Users className="nav-icon" />
                <span className="nav-text">Staff</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/workstreams" className="nav-link">
                <Layers className="nav-icon" />
                <span className="nav-text">Workstreams</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/pto" className="nav-link">
                <Umbrella className="nav-icon" />
                <span className="nav-text">PTO Requests</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hours" className="nav-link">
                <Clock className="nav-icon" />
                <span className="nav-text">Hours Tracking</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/org-chart-hierarchy" className="nav-link">
                <Network className="nav-icon" />
                <span className="nav-text">Org Chart</span>
              </NavLink>
            </li>
            {currentUser?.userRole === 'Admin' && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link">
                  <BarChart3 className="nav-icon" />
                  <span className="nav-text">Admin Analytics</span>
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink to="/command-center" className="nav-link">
                <Zap className="nav-icon" />
                <span className="nav-text">Command Center</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1rem' }}>
            {!collapsed && (
              <div style={{ fontSize: '0.875rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{currentUser?.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {currentUser?.title}
                </div>
                {currentUser?.userRole === 'Admin' && (
                  <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)' }}>
                    <Shield size={12} />
                    <span style={{ fontSize: '0.6875rem' }}>Administrator</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              logout()
              localStorage.clear()
              window.location.reload()
            }}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Switch User</span>}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <h1 className="page-title">{title}</h1>
        </div>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  )
}
