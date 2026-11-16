import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// The dev server must always run on port 3000 behind the Nginx proxy (which listens on 8080)
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));

// In-Memory Data Store (Cleaned state - all accounts and previous lessons deleted)
let lessons: any[] = [];
let exercises: any[] = [];
let videos: any[] = [];
let rankings: any[] = [];
let directMessages: any[] = [];

// =================== API ROUTES ===================

// Lessons API
app.get('/api/lessons', (_req: Request, res: Response) => {
  res.json(lessons);
});

app.post('/api/lessons', (req: Request, res: Response) => {
  const newLesson = req.body;
  if (!newLesson || !newLesson.title) {
    return res.status(400).json({ error: 'بيانات الدرس غير مكتملة' });
  }
  if (!newLesson.id) {
    newLesson.id = `lesson-${Date.now()}`;
  }
  const existsIndex = lessons.findIndex((l) => l.id === newLesson.id);
  if (existsIndex >= 0) {
    lessons[existsIndex] = newLesson;
  } else {
    lessons = [newLesson, ...lessons];
  }
  res.json({ success: true, lesson: newLesson, total: lessons.length });
});

app.delete('/api/lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  lessons = lessons.filter((l) => l.id !== id);
  res.json({ success: true, remaining: lessons.length });
});

// Exercises API
app.get('/api/exercises', (_req: Request, res: Response) => {
  res.json(exercises);
});

app.post('/api/exercises', (req: Request, res: Response) => {
  const newExercise = req.body;
  if (!newExercise || !newExercise.title) {
    return res.status(400).json({ error: 'بيانات التمرين غير مكتملة' });
  }
  if (!newExercise.id) {
    newExercise.id = `ex-${Date.now()}`;
  }
  const existsIndex = exercises.findIndex((ex) => ex.id === newExercise.id);
  if (existsIndex >= 0) {
    exercises[existsIndex] = newExercise;
  } else {
    exercises = [newExercise, ...exercises];
  }
  res.json({ success: true, exercise: newExercise, total: exercises.length });
});

app.delete('/api/exercises/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  exercises = exercises.filter((ex) => ex.id !== id);
  res.json({ success: true, remaining: exercises.length });
});

// Videos API
app.get('/api/videos', (_req: Request, res: Response) => {
  res.json(videos);
});

app.post('/api/videos', (req: Request, res: Response) => {
  const newVideo = req.body;
  if (!newVideo || !newVideo.title) {
    return res.status(400).json({ error: 'بيانات الفيديو غير مكتملة' });
  }
  if (!newVideo.id) {
    newVideo.id = `vid-${Date.now()}`;
  }
  videos = [newVideo, ...videos];
  res.json({ success: true, video: newVideo });
});

app.delete('/api/videos/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  videos = videos.filter((v) => v.id !== id);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', server: 'Science Middle School Platform', time: new Date().toISOString() });
});

// Download full project archive
app.get('/api/download-archive', (_req: Request, res: Response) => {
  const archivePath = path.resolve(__dirname, 'science_platform.tar.gz');
  if (!fs.existsSync(archivePath)) {
    return res.status(404).json({ error: 'Archive not found' });
  }
  res.download(archivePath, 'science_platform.tar.gz');
});

// Teacher Passcode Verification
app.post('/api/verify-teacher', (req: Request, res: Response) => {
  const { passcode } = req.body;
  if (passcode === '0542836997' || passcode === 'prof2026' || passcode === 'admin') {
    res.json({ success: true, message: 'رمز الأستاذ صحيح ومصرح بالدخول' });
  } else {
    res.status(401).json({ success: false, message: 'رمز المرور غير صحيح' });
  }
});

// Rankings API (First names only for classment)
app.get('/api/rankings', (_req: Request, res: Response) => {
  const sorted = [...rankings].sort((a, b) => b.points - a.points);
  res.json(sorted);
});

app.post('/api/rankings', (req: Request, res: Response) => {
  const { firstName, grade, points, avatar, badge, testsCompleted } = req.body;
  if (!firstName) {
    return res.status(400).json({ error: 'الاسم الأول مطلوب للترتيب' });
  }

  // Clean first name: take only the first word to ensure "first name only for the classment"
  const cleanFirstName = String(firstName).trim().split(/\s+/)[0];

  const existingIndex = rankings.findIndex(
    (r) => r.firstName.toLowerCase() === cleanFirstName.toLowerCase() && r.grade === grade
  );

  if (existingIndex >= 0) {
    rankings[existingIndex].points = Math.max(rankings[existingIndex].points, points || 0);
    if (avatar) rankings[existingIndex].avatar = avatar;
    if (badge) rankings[existingIndex].badge = badge;
    if (typeof testsCompleted === 'number') {
      rankings[existingIndex].testsCompleted = Math.max(
        rankings[existingIndex].testsCompleted || 0,
        testsCompleted
      );
    }
  } else {
    rankings.push({
      id: `st-${Date.now()}`,
      firstName: cleanFirstName,
      name: cleanFirstName,
      grade: grade || '4AM',
      points: points || 150,
      avatar: avatar || '👨‍🎓',
      rank: rankings.length + 1,
      badge: badge || 'تلميذ مجتهد ⭐',
      testsCompleted: testsCompleted || 0,
    });
  }

  // Recalculate ranks
  rankings.sort((a, b) => b.points - a.points);
  rankings = rankings.map((item, idx) => ({ ...item, rank: idx + 1 }));

  res.json({ success: true, rankings });
});

// Messages / Direct Questions for Teacher
app.get('/api/messages', (_req: Request, res: Response) => {
  res.json(directMessages);
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { studentName, studentGrade, topic, questionText } = req.body;
  if (!questionText) {
    return res.status(400).json({ error: 'نص السؤال مطلوب' });
  }

  const cleanFirstName = String(studentName || 'تلميذ').trim().split(/\s+/)[0];

  const newMsg = {
    id: `msg-${Date.now()}`,
    studentId: `st-${Date.now()}`,
    studentName: cleanFirstName,
    studentGrade: studentGrade || '4AM',
    topic: topic || 'علوم عامة',
    questionText: String(questionText).trim(),
    status: 'pending' as const,
    createdAt: 'الآن',
  };

  directMessages.unshift(newMsg);
  res.json({ success: true, message: newMsg });
});

app.post('/api/messages/:id/reply', (req: Request, res: Response) => {
  const { id } = req.params;
  const { replyText, teacherName } = req.body;

  const msg = directMessages.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'الرسالة غير موجودة' });
  }

  msg.status = 'answered';
  msg.replyText = replyText;
  msg.teacherName = teacherName || 'الأستاذ المشرف';
  msg.answeredAt = 'الآن';

  res.json({ success: true, message: msg });
});

// =================== SERVE FRONTEND ===================

async function startServer() {
  try {
    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
          watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }

    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    server.on('error', (err: any) => {
      console.error('HTTP server error:', err);
      if (err?.code === 'EADDRINUSE') {
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start dev server:', err);
    process.exit(1);
  }
}

startServer();
