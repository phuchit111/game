import express from 'express';
import cors from 'cors';
import pool, { initDb } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// GET /api/leaderboard/overall - Aggregate each player's best score per topic
app.get('/api/leaderboard/overall', async (req, res) => {
  try {
    const query = `
      WITH best_topic_scores AS (
        SELECT name, mission, MAX(score)::integer AS score
        FROM leaderboard
        WHERE mission IN ('attribute', 'vector', 'raster', 'rs', 'coordinate')
        GROUP BY name, mission
      )
      SELECT
        name,
        SUM(score)::integer AS score,
        COUNT(*)::integer AS played_topics,
        (COUNT(*) = 5) AS is_complete
      FROM best_topic_scores
      GROUP BY name
      ORDER BY score DESC, played_topics DESC, name ASC
      LIMIT 100;
    `;
    const { rows } = await pool.query(query);
    res.json({
      ok: true,
      data: rows.map((row) => ({
        name: row.name,
        score: row.score,
        playedTopics: row.played_topics,
        isComplete: row.is_complete,
      })),
    });
  } catch (err) {
    console.error('[API] Error fetching overall leaderboard:', err.message);
    res.status(500).json({ ok: false, error: 'Database query failed' });
  }
});

// GET /api/leaderboard - Get top 20 scores by mission
app.get('/api/leaderboard', async (req, res) => {
  const mission = req.query.mission || 'attribute';
  try {
    const query = `
      SELECT id, name, score, mode, mission, created_at as date
      FROM leaderboard
      WHERE mission = $1
      ORDER BY score DESC, created_at ASC
      LIMIT 20;
    `;
    const { rows } = await pool.query(query, [mission]);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('[API] Error fetching leaderboard:', err.message);
    res.status(500).json({ ok: false, error: 'Database query failed' });
  }
});

// POST /api/leaderboard - Submit new score
app.post('/api/leaderboard', async (req, res) => {
  const { name, score, mode, mission } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ ok: false, error: 'Player name is required' });
  }

  if (typeof score !== 'number' || isNaN(score)) {
    return res.status(400).json({ ok: false, error: 'Valid score is required' });
  }

  const cleanName = name.trim().slice(0, 30);
  const cleanMode = typeof mode === 'string' ? mode.slice(0, 20) : 'custom';
  const cleanMission = ['attribute', 'vector', 'raster', 'rs', 'coordinate'].includes(mission) ? mission : 'attribute';

  try {
    const insertQuery = `
      INSERT INTO leaderboard (name, score, mode, mission)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, score, mode, mission, created_at as date;
    `;
    const inserted = await pool.query(insertQuery, [cleanName, score, cleanMode, cleanMission]);
    const insertedId = inserted.rows[0].id;

    // Get updated top 20 for this mission
    const topQuery = `
      SELECT id, name, score, mode, mission, created_at as date
      FROM leaderboard
      WHERE mission = $1
      ORDER BY score DESC, created_at ASC
      LIMIT 20;
    `;
    const { rows: topList } = await pool.query(topQuery, [cleanMission]);

    // Calculate rank in this mission
    const rankQuery = `
      SELECT COUNT(*) + 1 as rank
      FROM leaderboard
      WHERE mission = $1 AND (score > $2 OR (score = $2 AND id < $3));
    `;
    const rankResult = await pool.query(rankQuery, [cleanMission, score, insertedId]);
    const rank = parseInt(rankResult.rows[0].rank, 10);

    res.json({
      ok: true,
      data: {
        record: inserted.rows[0],
        rank,
        topList,
      },
    });
  } catch (err) {
    console.error('[API] Error saving score:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to save score' });
  }
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`[API Server] Attribute Table Mission API listening on http://localhost:${port}`);
  });
});
