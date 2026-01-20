import { useEffect, useState } from 'react'
import { getWorkstreams, createWorkstreamRemote, updateWorkstreamRemote, deleteWorkstreamRemote, getStaff, onDataRefresh } from '../data/dataLayer'
import type { Workstream } from '../types'
import { Plus, Edit2, Trash2, X } from 'lucide-react'


export default function Workstreams() {
  const [workstreams, setWorkstreams] = useState(getWorkstreams())
  const [showModal, setShowModal] = useState(false)
  const [editingWorkstream, setEditingWorkstream] = useState<Workstream | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const staff = getStaff()

  const [formData, setFormData] = useState<Partial<Workstream>>({
    name: '',
    description: '',
    lead: '',
  })

  useEffect(() => {
    return onDataRefresh(() => setWorkstreams(getWorkstreams()))
  }, [])

  const handleOpenModal = (workstream?: Workstream) => {
    setSaveError(null)
    if (workstream) {
      setEditingWorkstream(workstream)
      setFormData(workstream)
    } else {
      setEditingWorkstream(null)
      setFormData({
        name: '',
        description: '',
        lead: staff[0]?.id || '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingWorkstream(null)
    setSaveError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setIsSaving(true)

    try {
      if (editingWorkstream) {
        await updateWorkstreamRemote(editingWorkstream.id, formData)
      } else {
        const newWorkstream: Workstream = {
          id: Date.now().toString(),
          name: formData.name!,
          description: formData.description!,
          lead: formData.lead!,
          color: '#3b82f6', // Color is auto-assigned based on name
          createdAt: new Date().toISOString(),
        }
        await createWorkstreamRemote(newWorkstream)
      }

      setWorkstreams(getWorkstreams())
      handleCloseModal()
    } catch (error) {
      console.error('Workstream save failed:', error)
      setSaveError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workstream?')) {
      setSaveError(null)
      setIsSaving(true)
      try {
        await deleteWorkstreamRemote(id)
        setWorkstreams(getWorkstreams())
      } catch (error) {
        console.error('Workstream delete failed:', error)
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
          <h3 className="card-title">Workstream Management</h3>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Add Workstream
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
          {workstreams.map((w) => {
            const lead = staff.find((s) => s.id === w.lead)
            return (
              <div
                key={w.id}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: w.color,
                    borderRadius: '9999px',
                    marginBottom: '1rem',
                  }}
                />
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {w.name}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {w.description}
                </p>
                <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Lead: </span>
                  <span style={{ fontWeight: '500' }}>{lead?.name || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenModal(w)}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(w.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingWorkstream ? 'Edit Workstream' : 'New Workstream'}
              </h3>
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
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Workstream Lead *</label>
                  <select
                    required
                    value={formData.lead}
                    onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingWorkstream ? 'Save Changes' : 'Create Workstream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
