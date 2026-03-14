-- Tabla para comentarios seguidos
CREATE TABLE tracked_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL UNIQUE,
  normalized_url TEXT,
  platform TEXT DEFAULT 'instagram',
  post_url TEXT,
  comment_id TEXT,
  post_id TEXT,
  comment_text TEXT,
  comment_author TEXT,
  target_account TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  current_likes INTEGER DEFAULT 0,
  current_replies INTEGER DEFAULT 0,
  current_status TEXT DEFAULT 'pending' CHECK (current_status IN ('pending', 'active', 'deleted', 'not_found', 'private', 'error')),
  campaign_tag TEXT,
  cm_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para snapshots históricos
CREATE TABLE comment_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracked_comment_id UUID REFERENCES tracked_comments(id) ON DELETE CASCADE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'deleted', 'not_found', 'private', 'error')),
  raw_json JSONB,
  response_time_ms INTEGER,
  error_message TEXT
);

-- Tabla para lotes de importación
CREATE TABLE import_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_rows INTEGER,
  success_rows INTEGER,
  failed_rows INTEGER
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_tracked_comments_source_url ON tracked_comments(source_url);
CREATE INDEX idx_tracked_comments_platform_status ON tracked_comments(platform, current_status);
CREATE INDEX idx_tracked_comments_last_checked ON tracked_comments(last_checked_at);
CREATE INDEX idx_comment_snapshots_comment_id ON comment_snapshots(tracked_comment_id);
CREATE INDEX idx_comment_snapshots_scraped_at ON comment_snapshots(scraped_at DESC);