import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Align server metadata with metadata.json
let appMetadata = {
  name: 'منصة علوم الطبيعة والحياة - الطور المتوسط',
  description: '',
};
try {
  const metaPath = path.resolve(__dirname, 'metadata.json');
  if (fs.existsSync(metaPath)) {
    const parsed = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    if (parsed?.name) appMetadata.name = parsed.name;
    if (parsed?.description) appMetadata.description = parsed.description;
  }
} catch {}

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
// In AI Studio dev/preview nginx proxies port 8080 -> 3000 (DEFAULT_APP_PORT=3000).
const PORT = isProduction
  ? Number(process.env.DEFAULT_APP_PORT || process.env.PORT || 3000)
  : 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Persistent Disk JSON Database for Web Platform Data
interface WebDatabaseState {
  lessons: any[];
  exercises: any[];
  videos: any[];
  tests: any[];
  rankings: any[];
  directMessages: any[];
  resources: any[];
  forumTopics: any[];
}

const DATA_DIR = path.resolve(__dirname, '.data');
const DB_FILE = path.join(DATA_DIR, 'web-db.json');

function loadDatabase(): WebDatabaseState {
  const empty: WebDatabaseState = {
    lessons: [],
    exercises: [],
    videos: [],
    tests: [],
    rankings: [],
    directMessages: [],
    resources: [],
    forumTopics: [],
  };
  try {
    if (!fs.existsSync(DB_FILE)) return empty;
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    return {
      lessons: Array.isArray(raw.lessons) ? raw.lessons : [],
      exercises: Array.isArray(raw.exercises) ? raw.exercises : [],
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      tests: Array.isArray(raw.tests) ? raw.tests : [],
      rankings: Array.isArray(raw.rankings) ? raw.rankings : [],
      directMessages: Array.isArray(raw.directMessages) ? raw.directMessages : [],
      resources: Array.isArray(raw.resources) ? raw.resources : [],
      forumTopics: Array.isArray(raw.forumTopics) ? raw.forumTopics : [],
    };
  } catch (err) {
    console.error('Failed to read web-db.json, starting fresh:', err);
    return empty;
  }
}

let dbState: WebDatabaseState = loadDatabase();

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(dbState), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist web-db.json:', err);
  }
}

// =================== API ROUTES ===================

// Full Web Data Sync Endpoint
app.get('/api/sync', (_req: Request, res: Response) => {
  res.json(dbState);
});

// Lessons API
app.get('/api/lessons', (_req: Request, res: Response) => {
  res.json(dbState.lessons);
});

app.post('/api/lessons', (req: Request, res: Response) => {
  const newLesson = req.body;
  if (!newLesson || !newLesson.title) {
    return res.status(400).json({ error: 'بيانات الدرس غير مكتملة' });
  }
  if (!newLesson.id) {
    newLesson.id = uuidv4();
  }
  const existsIndex = dbState.lessons.findIndex((l) => l.id === newLesson.id);
  if (existsIndex >= 0) {
    dbState.lessons[existsIndex] = newLesson;
  } else {
    dbState.lessons = [newLesson, ...dbState.lessons];
  }
  saveDatabase();
  res.json({ success: true, lesson: newLesson, total: dbState.lessons.length });
});

app.delete('/api/lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbState.lessons = dbState.lessons.filter((l) => l.id !== id);
  saveDatabase();
  res.json({ success: true, remaining: dbState.lessons.length });
});

// Exercises API
app.get('/api/exercises', (_req: Request, res: Response) => {
  res.json(dbState.exercises);
});

app.post('/api/exercises', (req: Request, res: Response) => {
  const newExercise = req.body;
  if (!newExercise || !newExercise.title) {
    return res.status(400).json({ error: 'بيانات التمرين غير مكتملة' });
  }
  if (!newExercise.id) {
    newExercise.id = uuidv4();
  }
  const existsIndex = dbState.exercises.findIndex((ex) => ex.id === newExercise.id);
  if (existsIndex >= 0) {
    dbState.exercises[existsIndex] = newExercise;
  } else {
    dbState.exercises = [newExercise, ...dbState.exercises];
  }
  saveDatabase();
  res.json({ success: true, exercise: newExercise, total: dbState.exercises.length });
});

app.delete('/api/exercises/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbState.exercises = dbState.exercises.filter((ex) => ex.id !== id);
  saveDatabase();
  res.json({ success: true, remaining: dbState.exercises.length });
});

// Videos API
app.get('/api/videos', (_req: Request, res: Response) => {
  res.json(dbState.videos);
});

app.post('/api/videos', (req: Request, res: Response) => {
  const newVideo = req.body;
  if (!newVideo || !newVideo.title) {
    return res.status(400).json({ error: 'بيانات الفيديو غير مكتملة' });
  }
  if (!newVideo.id) {
    newVideo.id = uuidv4();
  }
  const idx = dbState.videos.findIndex((v) => v.id === newVideo.id);
  if (idx >= 0) {
    dbState.videos[idx] = newVideo;
  } else {
    dbState.videos = [newVideo, ...dbState.videos];
  }
  saveDatabase();
  res.json({ success: true, video: newVideo });
});

app.delete('/api/videos/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbState.videos = dbState.videos.filter((v) => v.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// Custom Tests / Questions API
app.get('/api/tests', (_req: Request, res: Response) => {
  res.json(dbState.tests);
});

app.post('/api/tests', (req: Request, res: Response) => {
  const testObj = req.body;
  if (!testObj || !testObj.id) {
    return res.status(400).json({ error: 'بيانات الاختبار غير مكتملة' });
  }
  const idx = dbState.tests.findIndex((t) => t.id === testObj.id);
  if (idx >= 0) {
    dbState.tests[idx] = testObj;
  } else {
    dbState.tests = [testObj, ...dbState.tests];
  }
  saveDatabase();
  res.json({ success: true, test: testObj });
});

// Resources API
app.get('/api/resources', (_req: Request, res: Response) => {
  res.json(dbState.resources);
});

app.post('/api/resources', (req: Request, res: Response) => {
  const item = req.body;
  if (!item || !item.title) {
    return res.status(400).json({ error: 'بيانات المورد غير مكتملة' });
  }
  if (!item.id) item.id = uuidv4();
  const idx = dbState.resources.findIndex((r) => r.id === item.id);
  if (idx >= 0) {
    dbState.resources[idx] = item;
  } else {
    dbState.resources = [item, ...dbState.resources];
  }
  saveDatabase();
  res.json({ success: true, resource: item });
});

app.delete('/api/resources/:id', (req: Request, res: Response) => {
  dbState.resources = dbState.resources.filter((r) => r.id !== req.params.id);
  saveDatabase();
  res.json({ success: true });
});

// Forum Topics API
app.get('/api/forum', (_req: Request, res: Response) => {
  res.json(dbState.forumTopics);
});

app.post('/api/forum', (req: Request, res: Response) => {
  const topic = req.body;
  if (!topic || !topic.id) {
    return res.status(400).json({ error: 'بيانات الموضوع غير مكتملة' });
  }
  const idx = dbState.forumTopics.findIndex((t) => t.id === topic.id);
  if (idx >= 0) {
    dbState.forumTopics[idx] = topic;
  } else {
    dbState.forumTopics = [topic, ...dbState.forumTopics];
  }
  saveDatabase();
  res.json({ success: true, topic });
});

// Health check (aligned with metadata.json)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    server: appMetadata.name,
    description: appMetadata.description,
    time: new Date().toISOString(),
    counts: {
      lessons: dbState.lessons.length,
      exercises: dbState.exercises.length,
      videos: dbState.videos.length,
      rankings: dbState.rankings.length,
    },
  });
});

// Teacher Passcode Verification
app.post('/api/verify-teacher', (req: Request, res: Response) => {
  const cleanPasscode = String(req.body?.passcode || '').trim();
  const TEACHER_PASSCODE = (process.env.TEACHER_PASSCODE || '0542836997').trim();
  if (cleanPasscode === TEACHER_PASSCODE) {
    res.json({ success: true, message: 'رمز الأستاذ صحيح ومصرح بالدخول' });
  } else {
    res.status(401).json({ success: false, message: 'رمز المرور غير صحيح' });
  }
});

// Rankings API (First names only for classment)
app.get('/api/rankings', (_req: Request, res: Response) => {
  const sorted = [...dbState.rankings].sort((a, b) => b.points - a.points);
  res.json(sorted);
});

app.post('/api/rankings', (req: Request, res: Response) => {
  const { firstName, grade, points, avatar, badge, testsCompleted } = req.body;
  if (!firstName) {
    return res.status(400).json({ error: 'الاسم الأول مطلوب للترتيب' });
  }

  const cleanFirstName = String(firstName).trim().split(/\s+/)[0];

  const existingIndex = dbState.rankings.findIndex(
    (r) => r.firstName.toLowerCase() === cleanFirstName.toLowerCase() && r.grade === grade
  );

  if (existingIndex >= 0) {
    dbState.rankings[existingIndex].points = Math.max(dbState.rankings[existingIndex].points, points || 0);
    if (avatar) dbState.rankings[existingIndex].avatar = avatar;
    if (badge) dbState.rankings[existingIndex].badge = badge;
    if (typeof testsCompleted === 'number') {
      dbState.rankings[existingIndex].testsCompleted = Math.max(
        dbState.rankings[existingIndex].testsCompleted || 0,
        testsCompleted
      );
    }
  } else {
    dbState.rankings.push({
      id: uuidv4(),
      firstName: cleanFirstName,
      name: cleanFirstName,
      grade: grade || '4AM',
      points: points || 150,
      avatar: avatar || '👨‍🎓',
      rank: dbState.rankings.length + 1,
      badge: badge || 'تلميذ مجتهد ⭐',
      testsCompleted: testsCompleted || 0,
    });
  }

  dbState.rankings.sort((a, b) => b.points - a.points);
  dbState.rankings = dbState.rankings.map((item, idx) => ({ ...item, rank: idx + 1 }));
  saveDatabase();

  res.json({ success: true, rankings: dbState.rankings });
});

// Messages / Direct Questions for Teacher
app.get('/api/messages', (_req: Request, res: Response) => {
  res.json(dbState.directMessages);
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { id, studentId, studentName, studentGrade, topic, questionText } = req.body;
  if (!questionText) {
    return res.status(400).json({ error: 'نص السؤال مطلوب' });
  }

  const cleanFirstName = String(studentName || 'تلميذ').trim().split(/\s+/)[0];

  const newMsg = {
    id: id || uuidv4(),
    studentId: studentId || uuidv4(),
    studentName: cleanFirstName,
    studentGrade: studentGrade || '4AM',
    topic: topic || 'علوم عامة',
    questionText: String(questionText).trim(),
    status: 'pending' as const,
    createdAt: 'الآن',
  };

  if (!dbState.directMessages.some((m) => m.id === newMsg.id)) {
    dbState.directMessages.unshift(newMsg);
    saveDatabase();
  }
  res.json({ success: true, message: newMsg });
});

app.post('/api/messages/:id/reply', (req: Request, res: Response) => {
  const { id } = req.params;
  const { replyText, teacherName } = req.body;

  const msg = dbState.directMessages.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'الرسالة غير موجودة' });
  }

  msg.status = 'answered';
  msg.replyText = replyText;
  msg.teacherName = teacherName || 'الأستاذ المشرف';
  msg.answeredAt = 'الآن';
  saveDatabase();

  res.json({ success: true, message: msg });
});

// Guard unmatched API routes from returning HTML
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// =================== SERVE FRONTEND ===================

async function startServer() {
  let viteServer: { close: () => Promise<void> } | null = null;

  try {
    const distPath = path.resolve(__dirname, 'dist');
    const hasDistBuild = fs.existsSync(path.join(distPath, 'index.html'));

    if (!isProduction || !hasDistBuild) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
          ws: false,
          allowedHosts: true,
          watch:
            process.env.DISABLE_HMR === 'true'
              ? null
              : { ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/.data/**', '**/*.tar.gz'] },
        },
        appType: 'spa',
      });
      viteServer = vite;
      app.use(vite.middlewares);
    } else {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running at http://localhost:${PORT} (${appMetadata.name})`);
    });

    server.on('error', (err: any) => {
      console.error('HTTP server error:', err);
      if (err?.code === 'EADDRINUSE') {
        process.exit(1);
      }
    });

    let shuttingDown = false;
    const shutdown = async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      const forceTimer = setTimeout(() => process.exit(0), 500);
      try {
        if (viteServer) {
          await viteServer.close();
        }
      } catch {}
      try {
        if (typeof server.closeAllConnections === 'function') {
          server.closeAllConnections();
        }
        server.close(() => {
          clearTimeout(forceTimer);
          process.exit(0);
        });
      } catch {
        clearTimeout(forceTimer);
        process.exit(0);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
