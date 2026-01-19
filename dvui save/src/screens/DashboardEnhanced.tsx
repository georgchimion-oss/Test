import { useEffect, useMemo, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { getDeliverables, getWorkstreams, getStaff, onDataRefresh, updateDeliverable } from '../data/dataLayer'
import { AlertCircle, TrendingUp, CheckCircle2, Clock, MessageSquare, AlertTriangle, Edit2, History } from 'lucide-react'
import type { DashboardStats } from '../types'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ViewSwitcher, { type ViewType } from '../components/ViewSwitcher'
import TableView from '../components/TableView'
import KanbanView from '../components/KanbanView'
import { getAuditLogsByEntity, logAudit } from '../data/auditLayer'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const BUILD_STAMP = 'Push 2026-01-18 06:05 ET'

export default function DashboardEnhanced() {
  const { currentUser } = useAuth()
  const { theme, currentTheme } = useTheme()
  const [currentView, setCurrentView] = useState<ViewType>('cards')
  const [commentingOn, setCommentingOn] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [riskDeliverableId, setRiskDeliverableId] = useState<string | null>(null)
  const [auditVersion, setAuditVersion] = useState(0)
  const [historyDeliverableId, setHistoryDeliverableId] = useState<string | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDeliverableId, setEditingDeliverableId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    dueDate: '',
    partnerReviewDate: '',
    clientReviewDate: '',
    testingDate: '',
    status: '',
    risk: '',
    progress: 0,
    comment: '',
  })

  const [allDeliverables, setAllDeliverables] = useState(getDeliverables())
  const [workstreams, setWorkstreams] = useState(getWorkstreams())
  const [staff, setStaff] = useState(getStaff())

  useEffect(() => {
    return onDataRefresh(() => {
      setAllDeliverables(getDeliverables())
      setWorkstreams(getWorkstreams())
      setStaff(getStaff())
    })
  }, [])

  // Helper function to get status colors based on theme
  const getStatusColor = (status: string) => {
    if (currentTheme.statusColors) {
      const statusMap: Record<string, string> = {
        'Completed': currentTheme.statusColors.completed,
        'In Progress': currentTheme.statusColors.inProgress,
        'At Risk': currentTheme.statusColors.atRisk,
        'Blocked': currentTheme.statusColors.blocked,
        'Not Started': currentTheme.statusColors.notStarted,
      }
      return statusMap[status] || currentTheme.primary
    }
    // Default colors for other themes
    return status === 'Completed' ? '#10b981' :
           status === 'In Progress' ? '#3b82f6' :
           status === 'At Risk' ? '#ef4444' :
           status === 'Blocked' ? '#6b7280' : '#94a3b8'
  }

  // Filter deliverables to show those assigned to current user OR their supervisor
  const visibleDeliverables = useMemo(() => {
    return allDeliverables.filter((deliverable) =>
      deliverable.ownerId === currentUser?.id ||
      deliverable.ownerId === currentUser?.supervisorId
    )
  }, [allDeliverables, currentUser?.id, currentUser?.supervisorId])

  const stats: DashboardStats = useMemo(() => {
    const total = visibleDeliverables.length
    const completed = visibleDeliverables.filter((d) => d.status === 'Completed').length
    const inProgress = visibleDeliverables.filter((d) => d.status === 'In Progress').length
    const atRisk = visibleDeliverables.filter((d) => d.status === 'At Risk').length
    const blocked = visibleDeliverables.filter((d) => d.status === 'Blocked').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const avgProgress = total > 0 ? Math.round(visibleDeliverables.reduce((sum, d) => sum + d.progress, 0) / total) : 0

    return { totalDeliverables: total, completed, inProgress, atRisk, blocked, completionRate, avgProgress }
  }, [visibleDeliverables])

  const handleAddComment = (deliverableId: string) => {
    if (commentText.trim()) {
      updateDeliverable(deliverableId, { comment: commentText.trim() } as any)
      if (currentUser) {
        logAudit(
          currentUser.id,
          currentUser.name,
          'Added Comment',
          'Deliverable',
          deliverableId,
          `Commented: ${commentText.trim()}`
        )
      }
      setCommentText('')
      setCommentingOn(null)
      setAuditVersion((version) => version + 1)
    }
  }

  const handleCreateRisk = (deliverableId: string) => {
    setRiskDeliverableId(deliverableId)
    setShowRiskModal(true)
  }

  const handleSaveRisk = () => {
    if (riskDeliverableId) {
      updateDeliverable(riskDeliverableId, { status: 'At Risk' as any })
      if (currentUser) {
        logAudit(
          currentUser.id,
          currentUser.name,
          'Updated Status',
          'Deliverable',
          riskDeliverableId,
          'Marked as At Risk'
        )
      }
      alert('Risk created and deliverable marked as At Risk')
      setShowRiskModal(false)
      setRiskDeliverableId(null)
      setAuditVersion((version) => version + 1)
    }
  }

  const handleOpenHistory = (deliverableId: string) => {
    setHistoryDeliverableId(deliverableId)
    setShowHistoryModal(true)
  }

  const handleOpenEdit = (deliverableId: string) => {
    const deliverable = visibleDeliverables.find((d) => d.id === deliverableId)
    if (!deliverable) return
    setEditingDeliverableId(deliverableId)
    setEditForm({
      dueDate: deliverable.dueDate || '',
      partnerReviewDate: deliverable.partnerReviewDate || '',
      clientReviewDate: deliverable.clientReviewDate || '',
      testingDate: deliverable.testingDate || '',
      status: deliverable.status,
      risk: deliverable.risk,
      progress: deliverable.progress,
      comment: deliverable.comment || '',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editingDeliverableId) return
    const deliverable = visibleDeliverables.find((d) => d.id === editingDeliverableId)
    if (!deliverable) return

    const updates = {
      dueDate: editForm.dueDate,
      partnerReviewDate: editForm.partnerReviewDate,
      clientReviewDate: editForm.clientReviewDate,
      testingDate: editForm.testingDate,
      status: editForm.status as any,
      risk: editForm.risk as any,
      progress: Number(editForm.progress) || 0,
      comment: editForm.comment,
    }

    updateDeliverable(editingDeliverableId, updates)

    if (currentUser) {
      const changes: string[] = []
      if (deliverable.dueDate !== updates.dueDate) changes.push(`Due Date -> ${updates.dueDate}`)
      if (deliverable.partnerReviewDate !== updates.partnerReviewDate) changes.push(`Partner Review -> ${updates.partnerReviewDate}`)
      if (deliverable.clientReviewDate !== updates.clientReviewDate) changes.push(`Client Review -> ${updates.clientReviewDate}`)
      if (deliverable.testingDate !== updates.testingDate) changes.push(`Testing Date -> ${updates.testingDate}`)
      if (deliverable.status !== updates.status) changes.push(`Status -> ${updates.status}`)
      if (deliverable.risk !== updates.risk) changes.push(`Risk -> ${updates.risk}`)
      if (deliverable.progress !== updates.progress) changes.push(`Progress -> ${updates.progress}%`)
      if (deliverable.comment !== updates.comment && updates.comment) changes.push('Comment updated')

      logAudit(
        currentUser.id,
        currentUser.name,
        'Updated Deliverable',
        'Deliverable',
        editingDeliverableId,
        changes.length > 0 ? changes.join('; ') : 'Updated deliverable'
      )
    }

    setAuditVersion((version) => version + 1)
    setShowEditModal(false)
    setEditingDeliverableId(null)
  }

  const historyLogs = useMemo(() => {
    if (!historyDeliverableId) return []
    return getAuditLogsByEntity('Deliverable', historyDeliverableId)
  }, [historyDeliverableId, auditVersion])

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
          Showing {visibleDeliverables.length} deliverables assigned to you or your supervisor
        </p>
        <p style={{ color: currentTheme.textSecondary, fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {BUILD_STAMP}
        </p>
      </div>

      {/* View Switcher */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
          variant={theme === 'pwc' ? 'pwc' : 'default'}
        />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: `4px solid ${currentTheme.primary}`,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>My Deliverables</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '0.25rem' }}>{stats.totalDeliverables}</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>Assigned to you</div>
        </div>

        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: '4px solid #10b981',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Completion Rate</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '0.25rem' }}>{stats.completionRate}%</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {stats.completed} completed
          </div>
        </div>

        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: '4px solid #3b82f6',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '0.25rem' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>
            <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {stats.avgProgress}% avg progress
          </div>
        </div>

        <div style={{
          background: currentTheme.cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentTheme.cardBorder}`,
          borderLeft: `4px solid ${stats.atRisk > 0 ? '#ef4444' : '#10b981'}`,
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>At Risk</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: stats.atRisk > 0 ? '#ef4444' : '#10b981', marginBottom: '0.25rem' }}>{stats.atRisk}</div>
          <div style={{ fontSize: '0.8125rem', color: currentTheme.textSecondary }}>
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

      {/* Deliverable Cards */}
      <div style={{
        background: currentTheme.cardBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${currentTheme.cardBorder}`,
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentTheme.textPrimary, marginBottom: '1.5rem' }}>
          All My Deliverables
        </h3>

        {visibleDeliverables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: currentTheme.textSecondary }}>
            <p>No deliverables assigned to you yet.</p>
          </div>
        ) : (
          <>
            {currentView === 'table' && <TableView deliverables={visibleDeliverables} />}
            {currentView === 'kanban' && <KanbanView deliverables={visibleDeliverables} onUpdate={() => setAuditVersion((version) => version + 1)} />}
            {currentView === 'timeline' && (
              <div style={{ textAlign: 'center', padding: '3rem', color: currentTheme.textSecondary }}>
                <p>Timeline view coming soon...</p>
              </div>
            )}
            {currentView === 'cards' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {visibleDeliverables.map((d) => {
              const owner = staff.find((s) => s.id === d.ownerId)
              const workstream = workstreams.find((w) => w.id === d.workstreamId)
              const isCommenting = commentingOn === d.id

              return (
                <div
                  key={d.id}
                  style={{
                    background: currentTheme.cardBg,
                    border: `1px solid ${currentTheme.cardBorder}`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: currentTheme.textPrimary, marginBottom: '0.5rem' }}>
                        {d.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '0.75rem' }}>
                        {d.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: currentTheme.textSecondary }}>
                          <strong>Owner:</strong> {owner?.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: currentTheme.textSecondary }}>
                          <strong>Workstream:</strong> {workstream?.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: currentTheme.textSecondary }}>
                          <strong>Due:</strong> {new Date(d.dueDate).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            background: getStatusColor(d.status),
                            color: '#ffffff',
                          }}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEdit(d.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.cardBorder}`,
                          background: currentTheme.cardBg,
                          color: currentTheme.textPrimary,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCommentingOn(isCommenting ? null : d.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.cardBorder}`,
                          background: isCommenting ? currentTheme.primary : currentTheme.cardBg,
                          color: isCommenting ? 'white' : currentTheme.textPrimary,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <MessageSquare size={16} />
                        Update
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenHistory(d.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.cardBorder}`,
                          background: 'transparent',
                          color: currentTheme.textSecondary,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <History size={16} />
                        History
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreateRisk(d.id)
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <AlertTriangle size={16} />
                        Risk
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: currentTheme.textSecondary }}>
                      <span>Progress</span>
                      <span>{d.progress}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: currentTheme.cardBorder,
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${d.progress}%`,
                        background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>

                  {/* Comment Input */}
                  {isCommenting && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: currentTheme.cardBg,
                      borderRadius: '8px',
                    }}>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add an update or comment..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: `1px solid ${currentTheme.cardBorder}`,
                          background: currentTheme.cardBg,
                          color: currentTheme.textPrimary,
                          fontSize: '0.875rem',
                          minHeight: '80px',
                          resize: 'vertical',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleAddComment(d.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: currentTheme.primary,
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                          }}
                        >
                          Post Update
                        </button>
                        <button
                          onClick={() => {
                            setCommentingOn(null)
                            setCommentText('')
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: `1px solid ${currentTheme.cardBorder}`,
                            background: 'transparent',
                            color: currentTheme.textSecondary,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
            )}
          </>
        )}
      </div>

      {/* Risk Modal */}
      {showRiskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowRiskModal(false)}>
          <div style={{
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: '20px',
            maxWidth: '500px',
            width: '90%',
            padding: '2rem',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentTheme.textPrimary, marginBottom: '1rem' }}>
              Create Risk
            </h3>
            <p style={{ fontSize: '0.875rem', color: currentTheme.textSecondary, marginBottom: '1.5rem' }}>
              This will mark the deliverable as "At Risk" and notify relevant stakeholders.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSaveRisk}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Create Risk
              </button>
              <button
                onClick={() => setShowRiskModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.cardBorder}`,
                  background: 'transparent',
                  color: currentTheme.textPrimary,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: '20px',
            maxWidth: '560px',
            width: '90%',
            padding: '2rem',
            color: currentTheme.textPrimary,
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Edit Deliverable
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Due Date</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.cardBorder}`,
                      background: currentTheme.cardBg,
                      color: currentTheme.textPrimary,
                      marginTop: '0.35rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Partner Review</label>
                  <input
                    type="date"
                    value={editForm.partnerReviewDate}
                    onChange={(e) => setEditForm({ ...editForm, partnerReviewDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.cardBorder}`,
                      background: currentTheme.cardBg,
                      color: currentTheme.textPrimary,
                      marginTop: '0.35rem',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Client Review</label>
                  <input
                    type="date"
                    value={editForm.clientReviewDate}
                    onChange={(e) => setEditForm({ ...editForm, clientReviewDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.cardBorder}`,
                      background: currentTheme.cardBg,
                      color: currentTheme.textPrimary,
                      marginTop: '0.35rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Testing Date</label>
                  <input
                    type="date"
                    value={editForm.testingDate}
                    onChange={(e) => setEditForm({ ...editForm, testingDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.cardBorder}`,
                      background: currentTheme.cardBg,
                      color: currentTheme.textPrimary,
                      marginTop: '0.35rem',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.cardBorder}`,
                      background: currentTheme.cardBg,
                      color: currentTheme.textPrimary,
                      marginTop: '0.35rem',
                    }}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Risk</label>
                  <select
                    value={editForm.risk}
                    onChange={(e) => setEditForm({ ...editForm, risk: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.cardBorder}`,
                      background: currentTheme.cardBg,
                      color: currentTheme.textPrimary,
                      marginTop: '0.35rem',
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Progress %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editForm.progress}
                    onChange={(e) => setEditForm({ ...editForm, progress: Number(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.cardBorder}`,
                      background: currentTheme.cardBg,
                      color: currentTheme.textPrimary,
                      marginTop: '0.35rem',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>Comment</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${currentTheme.cardBorder}`,
                    background: currentTheme.cardBg,
                    color: currentTheme.textPrimary,
                    marginTop: '0.35rem',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentTheme.primary,
                  color: 'white',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.cardBorder}`,
                  background: 'transparent',
                  color: currentTheme.textPrimary,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyDeliverableId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowHistoryModal(false)}>
          <div style={{
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: '20px',
            maxWidth: '640px',
            width: '90%',
            padding: '2rem',
            color: currentTheme.textPrimary,
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Deliverable History
            </h3>
            {historyLogs.length === 0 ? (
              <p style={{ color: currentTheme.textSecondary }}>No history yet for this deliverable.</p>
            ) : (
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {historyLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      borderBottom: `1px solid ${currentTheme.cardBorder}`,
                      padding: '0.75rem 0',
                      display: 'flex',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ fontWeight: '600', minWidth: '140px' }}>{log.userName}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{log.action}</div>
                      <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>
                        {log.details}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary, whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.cardBorder}`,
                  background: 'transparent',
                  color: currentTheme.textPrimary,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
