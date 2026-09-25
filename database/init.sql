-- Initialize Attribute Table Mission Database

CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    mode VARCHAR(20) NOT NULL,
    mission VARCHAR(50) DEFAULT 'attribute',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast leaderboard retrieval by mission and score
CREATE INDEX IF NOT EXISTS idx_leaderboard_mission_score ON leaderboard (mission, score DESC, created_at ASC);

-- Initial default records
INSERT INTO leaderboard (name, score, mode) VALUES
    ('GIS_Explorer', 145, 'table'),
    ('MapperPro', 138, 'time'),
    ('GeoMaster', 120, 'table')
ON CONFLICT DO NOTHING;
