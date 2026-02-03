import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: '8h'
    });

    res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: '8h'
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login.' });
  }
});

app.get('/projects', requireAuth, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, status, start_date, end_date, owner_id, created_at
       FROM projects
       ORDER BY created_at DESC`
    );
    res.json({ projects: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load projects.' });
  }
});

app.post('/projects', requireAuth, async (req, res) => {
  const { name, status, startDate, endDate } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Project name is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (name, status, start_date, end_date, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, status, start_date, end_date, owner_id, created_at`,
      [name, status || 'active', startDate, endDate, req.user.userId]
    );

    res.status(201).json({ project: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

app.get('/work-logs', requireAuth, async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      `SELECT wl.id, wl.work_date, wl.hours, wl.description, wl.project_id, p.name AS project_name
       FROM work_logs wl
       LEFT JOIN projects p ON wl.project_id = p.id
       WHERE wl.user_id = $1 AND ($2::date IS NULL OR wl.work_date = $2::date)
       ORDER BY wl.work_date DESC, wl.created_at DESC`,
      [req.user.userId, date || null]
    );

    res.json({ workLogs: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load work logs.' });
  }
});

app.post('/work-logs', requireAuth, async (req, res) => {
  const { projectId, workDate, hours, description } = req.body;
  if (!workDate || !hours) {
    return res.status(400).json({ error: 'Work date and hours are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO work_logs (user_id, project_id, work_date, hours, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, work_date, hours, description, project_id, created_at`,
      [req.user.userId, projectId || null, workDate, hours, description || null]
    );

    res.status(201).json({ workLog: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create work log.' });
  }
});

app.get('/manager/overview', requireAuth, async (_req, res) => {
  try {
    const projectsResult = await pool.query(
      `SELECT status, COUNT(*)::int AS total
       FROM projects
       GROUP BY status`
    );

    const workLogsResult = await pool.query(
      `SELECT work_date, SUM(hours)::float AS total_hours
       FROM work_logs
       WHERE work_date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY work_date
       ORDER BY work_date DESC`
    );

    res.json({
      projectSummary: projectsResult.rows,
      lastWeekHours: workLogsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load manager overview.' });
  }
});

app.listen(port, () => {
  console.log(`Internal dashboard API running on port ${port}`);
});
