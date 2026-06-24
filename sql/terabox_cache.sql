CREATE TABLE IF NOT EXISTS terabox_cache (
  id BIGSERIAL PRIMARY KEY,
  url_hash TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  response_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terabox_cache_url_hash ON terabox_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_terabox_cache_created ON terabox_cache(created_at);

ALTER TABLE terabox_cache ENABLE ROW LEVEL SECURITY;
