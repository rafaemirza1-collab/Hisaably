CREATE TABLE IF NOT EXISTS zakat_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES zakat_sessions(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  amount NUMERIC DEFAULT 0,
  note TEXT,
  type TEXT NOT NULL DEFAULT 'payment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON zakat_journal(user_id, entry_date);

ALTER TABLE zakat_sessions ADD COLUMN IF NOT EXISTS payment_schedule TEXT DEFAULT 'monthly';
