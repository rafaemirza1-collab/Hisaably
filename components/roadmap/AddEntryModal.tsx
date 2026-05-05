'use client'
import { useState } from 'react'

interface Props {
  date: string
  sessionId: string
  currency: string
  onClose: () => void
  onSaved: () => Promise<void>
}

export function AddEntryModal({ date, sessionId, currency, onClose, onSaved }: Props) {
  const [type, setType] = useState<'payment' | 'reminder'>('payment')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  async function save() {
    setSaving(true)
    const res = await fetch('/api/zakat/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        entry_date: date,
        amount: type === 'payment' ? parseFloat(amount) || 0 : 0,
        note: note || null,
        type,
      }),
    })
    const json = await res.json()
    console.log('POST /api/zakat/journal response:', res.status, json)
    if (!res.ok) {
      console.error('Save failed:', json)
      setSaving(false)
      return
    }
    console.log('Calling onSaved / fetchEntries...')
    await onSaved()
    console.log('onSaved done, closing modal')
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#0D1F3E', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
        <p style={{ fontSize: 12, color: 'rgba(244,238,223,.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>{displayDate}</p>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F4EEDF', marginBottom: 20 }}>Log entry</h3>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['payment', 'reminder'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              border: `1px solid ${type === t ? '#10B981' : 'rgba(255,255,255,.1)'}`,
              background: type === t ? 'rgba(16,185,129,.15)' : 'transparent',
              color: type === t ? '#10B981' : 'rgba(244,238,223,.5)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {type === 'payment' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'rgba(244,238,223,.5)', display: 'block', marginBottom: 6 }}>Amount ({currency})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 14px', fontSize: 16, color: '#F4EEDF', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: 'rgba(244,238,223,.5)', display: 'block', marginBottom: 6 }}>{type === 'reminder' ? 'Reminder note' : 'Note (optional)'}</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder={type === 'reminder' ? 'e.g. Pay to local masjid' : 'e.g. Islamic Relief donation'}
            style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#F4EEDF', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: 'rgba(244,238,223,.5)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving || (type === 'payment' && !amount)}
            style={{ flex: 2, padding: '10px 0', borderRadius: 12, border: 'none', background: '#10B981', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? .6 : 1 }}>
            {saving ? 'Saving…' : type === 'payment' ? 'Log payment' : 'Add reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}
