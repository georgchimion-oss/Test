import { useEffect, useState } from 'react'
import { getStaff, createStaffRemote, updateStaffRemote, deleteStaffRemote, getWorkstreams, onDataRefresh } from '../data/dataLayer'
import type { Staff } from '../types'
import { Plus, Edit2, Trash2, X, UserCheck, UserX } from 'lucide-react'

export default function StaffScreen() {
  const [staff, setStaff] = useState(getStaff())
  const [workstreams] = useState(getWorkstreams())
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: '',
    email: '',
    department: '',
    title: 'Associate',
    supervisorId: undefined,
    workstreamIds: [],
    userRole: 'User',
    isActive: true,
  })

  useEffect(() => {
    return onDataRefresh(() => setStaff(getStaff()))
  }, [])

  const handleOpenModal = (staffMember?: Staff) => {
    setSaveError(null)
    if (staffMember) {
      setEditingStaff(staffMember)
      setFormData(staffMember)
    } else {
      setEditingStaff(null)
      setFormData({
        name: '',
        role: '',
        email: '',
        department: '',
        title: 'Associate',
        supervisorId: undefined,
        workstreamIds: [],
        userRole: 'User',
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingStaff(null)
    setSaveError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setIsSaving(true)

    try {
      if (editingStaff) {
        await updateStaffRemote(editingStaff.id, formData)
      } else {
        const newStaff: Staff = {
          id: Date.now().toString(),
          name: formData.name!,
          title: formData.title!,
          role: formData.role!,
          email: formData.email!,
          department: formData.department!,
          supervisorId: formData.supervisorId,
          workstreamIds: formData.workstreamIds || [],
          userRole: formData.userRole!,
          isActive: formData.isActive!,
          createdAt: new Date().toISOString(),
        }
        await createStaffRemote(newStaff)
      }

      setStaff(getStaff())
      handleCloseModal()
    } catch (error) {
      console.error('Staff save failed:', error)
      setSaveError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setSaveError(null)
      setIsSaving(true)
      try {
        await deleteStaffRemote(id)
        setStaff(getStaff())
      } catch (error) {
        console.error('Staff delete failed:', error)
        setSaveError(error instanceof Error ? error.message : String(error))
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Staff Management</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: '500' }}>{s.name}</td>
                <td>{s.title}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                <td>
                  {s.isActive ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                      <UserCheck size={16} />
                      Active
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <UserX size={16} />
                      Inactive
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenModal(s)}
                      style={{ padding: '0.375rem' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s.id)}
                      style={{ padding: '0.375rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingStaff ? 'Edit Staff Member' : 'New Staff Member'}</h3>
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
                {saveError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    {saveError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <select
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value as any })}
                  >
                    <option value="Associate">Associate</option>
                    <option value="Senior Associate">Senior Associate</option>
                    <option value="Manager">Manager</option>
                    <option value="Senior Manager">Senior Manager</option>
                    <option value="Director">Director</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Supervisor</label>
                  <select
                    value={formData.supervisorId || ''}
                    onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value || undefined })}
                  >
                    <option value="">-- No Supervisor --</option>
                    {staff.filter(s => s.id !== editingStaff?.id).map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.title})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">User Role *</label>
                  <select
                    required
                    value={formData.userRole}
                    onChange={(e) => setFormData({ ...formData, userRole: e.target.value as any })}
                  >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Workstreams</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {workstreams.map(ws => (
                      <label key={ws.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={(formData.workstreamIds || []).includes(ws.id)}
                          onChange={(e) => {
                            const current = formData.workstreamIds || []
                            setFormData({
                              ...formData,
                              workstreamIds: e.target.checked
                                ? [...current, ws.id]
                                : current.filter(id => id !== ws.id)
                            })
                          }}
                          style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{ws.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <span className="form-label" style={{ marginBottom: 0 }}>Active</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
