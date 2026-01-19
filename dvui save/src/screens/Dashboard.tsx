import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { getDeliverables, getWorkstreams, getStaff } from '../data/dataLayer'
import { AlertCircle, TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import type { DashboardStats } from '../types'
import { useAuth } from '../context/AuthContext'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const allDeliverables = getDeliverables()
  const workstreams = getWorkstreams()
  const staff = getStaff()

  // Filter deliverables to show those assigned to current user OR their supervisor
  const deliverables = useMemo(() => {
    return allDeliverables.filter(d =>
      d.ownerId === currentUser?.id ||
      d.ownerId === currentUser?.supervisorId
    )
  }, [allDeliverables, currentUser?.id, currentUser?.supervisorId])

  const stats: DashboardStats = useMemo(() => {
    const total = deliverables.length
    const completed = deliverables.filter((d) => d.status === 'Completed').length
    const inProgress = deliverables.filter((d) => d.status === 'In Progress').length
    const atRisk = deliverables.filter((d) => d.status === 'At Risk').length
    const blocked = deliverables.filter((d) => d.status === 'Blocked').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const avgProgress = total > 0 ? Math.round(deliverables.reduce((sum, d) => sum + d.progress, 0) / total) : 0

    return { totalDeliverables: total, completed, inProgress, atRisk, blocked, completionRate, avgProgress }
  }, [deliverables])

  const statusChartData = {
    labels: ['Completed', 'In Progress', 'At Risk', 'Blocked', 'Not Started'],
    datasets: [
      {
        data: [
          stats.completed,
          stats.inProgress,
          stats.atRisk,
          stats.blocked,
          deliverables.filter((d) => d.status === 'Not Started').length,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(148, 163, 184, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const workstreamChartData = {
    labels: workstreams.map((w) => w.name),
    datasets: [
      {
        label: 'Deliverables',
        data: workstreams.map(
          (w) => deliverables.filter((d) => d.workstreamId === w.id).length
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  }

  const upcomingDeliverables = useMemo(() => {
    const today = new Date()
    return deliverables
      .filter((d) => d.status !== 'Completed' && new Date(d.dueDate) > today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }, [deliverables])

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Showing deliverables assigned to you or your supervisor
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">My Deliverables</div>
          <div className="stat-value">{stats.totalDeliverables}</div>
          <div className="stat-change">Assigned to you</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{stats.completionRate}%</div>
          <div className="stat-change">
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {stats.completed} completed
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-change">
            <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {stats.avgProgress}% avg progress
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">At Risk</div>
          <div className="stat-value" style={{ color: stats.atRisk > 0 ? '#ef4444' : '#10b981' }}>
            {stats.atRisk}
          </div>
          <div className={`stat-change ${stats.atRisk > 0 ? 'negative' : ''}`}>
            {stats.atRisk > 0 ? (
              <>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Needs attention
              </>
            ) : (
              <>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                On track
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Status Distribution</h3>
          </div>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Doughnut
              data={statusChartData}
              options={{
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#f1f5f9' } },
                },
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Deliverables by Workstream</h3>
          </div>
          <Bar
            data={workstreamChartData}
            options={{
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
              },
            }}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upcoming Deliverables</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/deliverables')}>
            View All
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {upcomingDeliverables.map((d) => {
              const owner = staff.find((s) => s.id === d.ownerId)
              return (
                <tr
                  key={d.id}
                  onClick={() => navigate('/deliverables')}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{d.title}</td>
                  <td>{owner?.name || 'Unknown'}</td>
                  <td>
                    <span className={`badge badge-${d.status.toLowerCase().replace(' ', '-')}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{new Date(d.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${d.progress}%` }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
