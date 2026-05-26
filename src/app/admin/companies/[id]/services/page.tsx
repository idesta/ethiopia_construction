'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/Sidebar'
import { useToast } from '@/components/ui/ToastProvider'
import { Service, Tenant } from '@/app/admin/types'

const EMPTY_SERVICE: Omit<Service, 'id' | 'tenant_id'> = {
  title: '', description: '', icon: '🏗️', sort_order: 0,
}

const ICON_OPTIONS = ['🏗️','🏛️','🛣️','📐','🏠','🏢','🔧','⚙️','🏭','🌉','🏗️','🛠️','📏','🧱']

export default function ServicesPage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const tenantId = params.id as string

  const [userEmail, setUserEmail]   = useState('')
  const [tenant, setTenant]         = useState<Tenant | null>(null)
  const [services, setServices]     = useState<Service[]>([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<Service | null>(null)
  const [form, setForm]             = useState(EMPTY_SERVICE)
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin'); return }
      setUserEmail(user.email || '')

      const { data: t } = await supabase.from('tenants').select('*').eq('id', tenantId).single()
      if (!t) { router.push('/admin/dashboard'); return }
      setTenant(t)

      const { data: s } = await supabase
        .from('services').select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order', { ascending: true })
      setServices(s || [])
      setLoading(false)
    }
    load()
  }, [tenantId, router])

  function openNew() { setEditing(null); setForm(EMPTY_SERVICE); setModalOpen(true) }
  function openEdit(s: Service) {
    setEditing(s)
    setForm({ title: s.title, description: s.description || '',
      icon: s.icon || '🏗️', sort_order: s.sort_order || 0 })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title) { showToast('Title is required', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    try {
      if (editing) {
        await supabase.from('services').update({ ...form }).eq('id', editing.id)
        setServices(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s))
        showToast('Service updated!', 'success')
      } else {
        const { data } = await supabase
          .from('services').insert({ ...form, tenant_id: tenantId }).select().single()
        if (data) setServices(prev => [...prev, data])
        showToast('Service added!', 'success')
      }
      setModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      showToast(msg || 'Save failed', 'error')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
    setDeleteId(null)
    showToast('Service deleted', 'info')
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="admin-layout">
      <Sidebar userEmail={userEmail} />

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/admin/companies/${tenantId}`)}>
              ← {tenant?.name}
            </button>
            <div className="topbar-title">Services</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add Service</button>
        </div>

        <div className="admin-content">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Services Offered ({services.length})</div>
              <button className="btn btn-secondary btn-sm" onClick={openNew}>+ New</button>
            </div>

            {services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚙️</div>
                <div className="empty-state-text">No services defined yet</div>
                <div className="empty-state-sub">
                  Add services this company offers — they&apos;ll appear on the website
                </div>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openNew}>
                  Add First Service
                </button>
              </div>
            ) : (
              <div style={{ padding: '1rem', display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {services.map(service => (
                  <div key={service.id} style={{
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    borderRadius: '10px', padding: '1.25rem',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{service.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#e2e2e2', marginBottom: '0.4rem' }}>
                      {service.title}
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {service.description || 'No description'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(service)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(service.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Service' : 'New Service'}</div>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {ICON_OPTIONS.map(icon => (
                      <button
                        key={icon} type="button"
                        onClick={() => setForm(p => ({ ...p, icon }))}
                        style={{
                          width: 38, height: 38, borderRadius: 6,
                          border: form.icon === icon ? '2px solid #f4a61d' : '1px solid #2a2a2a',
                          background: form.icon === icon ? '#1a1500' : '#1a1a1a',
                          fontSize: '1.3rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input className="form-input" placeholder="Or type any emoji"
                    value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input className="form-input" placeholder="Building Construction"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input"
                    placeholder="Brief description of this service..."
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order (lower = first)</label>
                  <input type="number" className="form-input" placeholder="0"
                    value={form.sort_order}
                    onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '380px' }}>
            <div className="modal-header"><div className="modal-title">Delete Service?</div></div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#888' }}>This will permanently remove this service.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#555' }}>Loading...</p>
    </div>
  )
}
