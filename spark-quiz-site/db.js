const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, 'sparkquiz.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    position INTEGER,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS game_results (
    id TEXT PRIMARY KEY,
    pin TEXT,
    played_at INTEGER,
    leaderboard TEXT
  );
`);

// one-time seed from questions.json if the table is empty
const count = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
if (count === 0) {
  const seedPath = path.join(__dirname, 'questions.json');
  if (fs.existsSync(seedPath)) {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    const insert = db.prepare('INSERT INTO questions (id, position, data) VALUES (?, ?, ?)');
    seed.forEach((q, i) => {
      if (!q.type) q.type = 'multiple_choice';
      if (q.image === undefined) q.image = null;
      if (q.audio === undefined) q.audio = null;
      insert.run(q.id, i, JSON.stringify(q));
    });
  }
}

function getAllQuestions() {
  const rows = db.prepare('SELECT data FROM questions ORDER BY position ASC').all();
  return rows.map(r => JSON.parse(r.data));
}

function saveAllQuestions(questions) {
  const tx = db.transaction((qs) => {
    db.prepare('DELETE FROM questions').run();
    const insert = db.prepare('INSERT INTO questions (id, position, data) VALUES (?, ?, ?)');
    qs.forEach((q, i) => insert.run(q.id, i, JSON.stringify(q)));
  });
  tx(questions);
}

function saveGameResult(id, pin, leaderboard) {
  db.prepare('INSERT INTO game_results (id, pin, played_at, leaderboard) VALUES (?, ?, ?, ?)')
    .run(id, pin, Date.now(), JSON.stringify(leaderboard));
}

module.exports = { db, getAllQuestions, saveAllQuestions, saveGameResult };
