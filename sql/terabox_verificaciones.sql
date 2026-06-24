CREATE TABLE IF NOT EXISTS terabox_verificaciones (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  user_agent TEXT,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terabox_verificaciones_ip ON terabox_verificaciones(ip);
CREATE INDEX IF NOT EXISTS idx_terabox_verificaciones_token ON terabox_verificaciones(token_hash);
CREATE INDEX IF NOT EXISTS idx_terabox_verificaciones_created ON terabox_verificaciones(created_at);

ALTER TABLE terabox_verificaciones ENABLE ROW LEVEL SECURITY;
