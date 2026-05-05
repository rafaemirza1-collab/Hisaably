// 2026 Islamic calendar dates (Gregorian equivalents, approximate)
export interface IslamicEvent {
  date: string   // YYYY-MM-DD
  name: string
  emoji: string
  multi?: number // spans multiple days
}

export const ISLAMIC_EVENTS_2026: IslamicEvent[] = [
  // Ramadan 2026: Feb 18 – Mar 19
  { date: '2026-02-18', name: 'Ramadan Begins', emoji: '🌙' },
  { date: '2026-03-05', name: "Laylat al-Qadr*", emoji: '✨' },  // 27th Ramadan
  { date: '2026-03-19', name: 'Last day of Ramadan', emoji: '🌙' },
  // Eid al-Fitr
  { date: '2026-03-20', name: 'Eid al-Fitr', emoji: '🎉' },
  { date: '2026-03-21', name: 'Eid al-Fitr (Day 2)', emoji: '🎉' },
  { date: '2026-03-22', name: 'Eid al-Fitr (Day 3)', emoji: '🎉' },
  // Islamic New Year (1 Muharram 1448)
  { date: '2026-06-16', name: 'Islamic New Year', emoji: '🌙' },
  // Ashura (10 Muharram)
  { date: '2026-06-25', name: 'Ashura', emoji: '🤲' },
  // Mawlid al-Nabi (12 Rabi al-Awwal)
  { date: '2026-08-23', name: "Mawlid al-Nabi", emoji: '⭐' },
  // Dhul Hijjah
  { date: '2026-05-18', name: '1st Dhul Hijjah', emoji: '📿' },
  { date: '2026-05-27', name: 'Day of Arafah', emoji: '🤲' },
  // Eid al-Adha
  { date: '2026-05-28', name: 'Eid al-Adha', emoji: '🐑' },
  { date: '2026-05-29', name: 'Eid al-Adha (Day 2)', emoji: '🐑' },
  { date: '2026-05-30', name: 'Eid al-Adha (Day 3)', emoji: '🐑' },
  // Isra Miraj (27 Rajab)
  { date: '2026-02-04', name: "Isra' wal Mi'raj", emoji: '🌟' },
  // Shab e Barat (15 Shaban)
  { date: '2026-03-05', name: "Shab-e-Barat", emoji: '🌕' },
]

// Build a lookup map: dateStr -> events[]
export const ISLAMIC_EVENT_MAP: Record<string, IslamicEvent[]> = {}
for (const event of ISLAMIC_EVENTS_2026) {
  if (!ISLAMIC_EVENT_MAP[event.date]) ISLAMIC_EVENT_MAP[event.date] = []
  ISLAMIC_EVENT_MAP[event.date].push(event)
}
