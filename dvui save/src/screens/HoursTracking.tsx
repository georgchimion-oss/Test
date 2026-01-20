import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getHoursLogs,
  createHoursLog,
  updateHoursLog,
  deleteHoursLog,
  getDeliverables,
  getStaff,
  onDataRefresh,
} from '../data/dataLayer'
import { logAudit } from '../data/auditLayer'
import type { HoursLog } from '../types'
import { Plus, Edit2, Trash2, X, Clock } from 'lucide-react'

export default function HoursTracking() {
  const { currentUser } = useAuth()
  const [logs, setLogs] = useState(getHoursLogs())
  const [showModal, setShowModal] = useState(false)
  const [editingLog, setEditingLog] = useState<HoursLog | null>(null)
  const deliverables = getDeliverables()
  getStaff() // Load staff data

  const [formData, setFormData] = useState<Partial<HoursLog>>({
    staffId: currentUser?.id || '',
    deliverableId: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: '',
  })

  useEffect(() => {
    return onDataRefresh(() => setLogs(getHoursLogs()))
  }, [])

  const myLogs = useMemo(() => {
    return logs
      .filter((l) => l.staffId === currentUser?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [logs, currentUser])

  const totalHours = useMemo(() => {
    return myLogs.reduce((sum, log) => sum + log.hours, 0)
  }, [myLogs])

  const thisWeekHours = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    return myLogs
      .filter((log) => new Date(log.date) >= weekStart)
      .reduce((sum, log) => sum + log.hours, 0)
  }, [myLogs])

  const handleOpenModal = (log?: HoursLog) => {
    if (log) {
      setEditingLog(log)
      setFormData(log)
    } else {
      setEditingLog(null)
      setFormData({
        staffId: currentUser?.id || '',
        deliverableId: deliverables[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        description: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLog(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingLog) {
      updateHoursLog(editingLog.id, formData)
      logAudit(
        currentUser!.id,
        currentUser!.name,
        'Updated Hours Log',
        'Hours',
        editingLog.id,
        `Updated ${formData.hours} hours`
      )
    } else {
      const newLog: HoursLog = {
        id: Date.now().toString(),
        staffId: formData.staffId!,
        deliverableId: formData.deliverableId!,
        date: formData.date!,
        hours: formData.hours!,
        description: formData.description!,
        createdAt: new Date().toISOString(),
      }
      createHoursLog(newLog)
      logAudit(
        currentUser!.id,
        currentUser!.name,
        'Logged Hours',
        'Hours',
        newLog.id,
        `Logged ${formData.hours} hours on ${formData.date}`
      )
    }

    setLogs(getHoursLogs())
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hours log?')) {
      deleteHoursLog(id)
      logAudit(currentUser!.id, currentUser!.name, 'Deleted Hours Log', 'Hours', id, `Deleted hours log`)
      setLogs(getHoursLogs())
    }
  }

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Log Hours
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-label">This Week</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              {thisWeekHours}h
            </div>
            <div className="stat-change">Total hours logged</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">All Time</div>
            <div className="stat-value">{totalHours}h</div>
            <div className="stat-change">{myLogs.length} entries</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average/Week</div>
            <div className="stat-value">{myLogs.length > 0 ? Math.round(totalHours / Math.max(1, Math.ceil(myLogs.length / 5))) : 0}h</div>
            <div className="stat-change">Estimated average</div>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Deliverable</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myLogs.map((log) => {
                const deliverable = deliverables.find((d) => d.id === log.deliverableId)
                return (
                  <tr key={log.id}>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '500' }}>{deliverable?.title || 'Unknown'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <Clock size={14} />
                        {log.hours}h
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.description}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenModal(log)}
                          style={{ padding: '0.375rem' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(log.id)}
                          style={{ padding: '0.375rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingLog ? 'Edit Hours Log' : 'Log Hours'}</h3>
              <button
                onClick={handleCloseModal}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.5rem', minWidth: 'auto' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Deliverable *</label>
                  <select
                    required
                    value={formData.deliverableId}
                    onChange={(e) => setFormData({ ...formData, deliverableId: e.target.value })}
                  >
                    <option value="">-- Select Deliverable --</option>
                    {deliverables.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hours *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.25"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What did you work on?"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLog ? 'Save Changes' : 'Log Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
