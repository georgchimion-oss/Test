import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getPTORequests,
  createPTORequest,
  updatePTORequest,
  deletePTORequest,
  getStaff,
  onDataRefresh,
} from '../data/dataLayer'
import { logAudit } from '../data/auditLayer'
import type { PTORequest } from '../types'
import { Plus, Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react'

export default function PTORequests() {
  const { currentUser, isManager } = useAuth()
  const [requests, setRequests] = useState(getPTORequests())
  const [showModal, setShowModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState<PTORequest | null>(null)
  const staff = getStaff()

  const [formData, setFormData] = useState<Partial<PTORequest>>({
    staffId: currentUser?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'Vacation',
    status: 'Pending',
    notes: '',
  })

  useEffect(() => {
    return onDataRefresh(() => setRequests(getPTORequests()))
  }, [])

  const myRequests = requests.filter((r) => r.staffId === currentUser?.id)

  // Team requests: show if user is a supervisor OR if user is an Admin (can approve any)
  const teamRequests = isManager
    ? requests.filter((r) => {
        const requestStaff = staff.find((s) => s.id === r.staffId)
        // Show if this is their direct report OR if current user is Admin
        return (
          requestStaff?.supervisorId === currentUser?.id ||
          currentUser?.userRole === 'Admin'
        )
      })
    : []

  const handleOpenModal = (request?: PTORequest) => {
    if (request) {
      setEditingRequest(request)
      setFormData(request)
    } else {
      setEditingRequest(null)
      setFormData({
        staffId: currentUser?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        type: 'Vacation',
        status: 'Pending',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRequest(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingRequest) {
      updatePTORequest(editingRequest.id, formData)
      logAudit(
        currentUser!.id,
        currentUser!.name,
        'Updated PTO Request',
        'PTO',
        editingRequest.id,
        `Updated PTO request for ${formData.type}`
      )
    } else {
      const newRequest: PTORequest = {
        id: Date.now().toString(),
        staffId: formData.staffId!,
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        type: formData.type as PTORequest['type'],
        status: 'Pending',
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      }
      createPTORequest(newRequest)
      logAudit(
        currentUser!.id,
        currentUser!.name,
        'Created PTO Request',
        'PTO',
        newRequest.id,
        `Requested ${formData.type} from ${formData.startDate} to ${formData.endDate}`
      )
    }

    setRequests(getPTORequests())
    handleCloseModal()
  }

  const handleApprove = (request: PTORequest) => {
    updatePTORequest(request.id, {
      status: 'Approved',
      approvedBy: currentUser?.id,
      approvedAt: new Date().toISOString(),
    })
    logAudit(
      currentUser!.id,
      currentUser!.name,
      'Approved PTO Request',
      'PTO',
      request.id,
      `Approved PTO request`
    )
    setRequests(getPTORequests())
  }

  const handleReject = (request: PTORequest) => {
    updatePTORequest(request.id, {
      status: 'Rejected',
      approvedBy: currentUser?.id,
      approvedAt: new Date().toISOString(),
    })
    logAudit(
      currentUser!.id,
      currentUser!.name,
      'Rejected PTO Request',
      'PTO',
      request.id,
      `Rejected PTO request`
    )
    setRequests(getPTORequests())
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this PTO request?')) {
      deletePTORequest(id)
      logAudit(currentUser!.id, currentUser!.name, 'Deleted PTO Request', 'PTO', id, `Deleted PTO request`)
      setRequests(getPTORequests())
    }
  }

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>My PTO Requests</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            New Request
          </button>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map((r) => (
                <tr key={r.id}>
                  <td>{r.type}</td>
                  <td>{new Date(r.startDate).toLocaleDateString()}</td>
                  <td>{new Date(r.endDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === 'Approved'
                          ? 'badge-completed'
                          : r.status === 'Rejected'
                          ? 'badge-high'
                          : 'badge-medium'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.notes}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {r.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenModal(r)}
                            style={{ padding: '0.375rem' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(r.id)}
                            style={{ padding: '0.375rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isManager && teamRequests.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Team Requests (Pending Approval)
          </h2>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamRequests
                  .filter((r) => r.status === 'Pending')
                  .map((r) => {
                    const employee = staff.find((s) => s.id === r.staffId)
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '500' }}>{employee?.name}</td>
                        <td>{r.type}</td>
                        <td>{new Date(r.startDate).toLocaleDateString()}</td>
                        <td>{new Date(r.endDate).toLocaleDateString()}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.notes}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleApprove(r)}
                              style={{ padding: '0.375rem', background: 'var(--secondary)' }}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(r)}
                              style={{ padding: '0.375rem' }}
                            >
                              <XCircle size={14} />
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
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingRequest ? 'Edit PTO Request' : 'New PTO Request'}</h3>
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
                  <label className="form-label">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PTORequest['type'] })}
                  >
                    <option value="Vacation">Vacation</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional details..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRequest ? 'Save Changes' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
