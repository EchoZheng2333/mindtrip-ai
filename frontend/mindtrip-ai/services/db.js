// 心旅 AI — SQLite 数据库层（node:sqlite 内置，零依赖）
// 表：
//   users          用户（轻量：session 驱动，可填昵称）
//   journey_shares 旅程分享（归途卡 → 分享链接，无状态可访问）
//   user_scenes    用户上传场地/活动（众包数据，备选池可用）
//   shared_routes  路线分享（社区：保存动线模板 → 一键采用）

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'data', 'mindtrip.db');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,        -- session id（轻量用户）
    nickname   TEXT DEFAULT '旅人',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS journey_shares (
    token           TEXT PRIMARY KEY,
    nickname        TEXT,
    profile_name    TEXT,
    aesthetic_dna   TEXT,
    pre_score       INTEGER,
    return_score    INTEGER,
    improvement     INTEGER,
    pre_tags        TEXT,                -- JSON 数组
    return_tags     TEXT,                -- JSON 数组
    poetic_summary  TEXT,
    checkin_places  TEXT,                -- JSON 数组
    created_at      TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS user_scenes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        TEXT,
    name           TEXT NOT NULL,
    type           TEXT DEFAULT '景点',
    description    TEXT DEFAULT '',
    coords         TEXT DEFAULT '117.21,29.28',
    business_hours TEXT DEFAULT '全天',
    price_level    TEXT DEFAULT '中',
    status         TEXT DEFAULT 'approved',  -- approved / pending
    created_at     TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS shared_routes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT,
    nickname   TEXT DEFAULT '旅人',
    city       TEXT DEFAULT 'jingdezhen',
    name       TEXT NOT NULL,
    desc       TEXT DEFAULT '',
    scenes     TEXT NOT NULL,            -- JSON 数组 [scene_id, ...]
    likes      INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

// ---------- 用户（轻量：session 驱动） ----------
function ensureUser(userId, nickname) {
  if (!userId) return null;
  db.prepare('INSERT OR IGNORE INTO users(id, nickname) VALUES (?, ?)').run(userId, nickname || '旅人');
  if (nickname && nickname !== '旅人') {
    db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, userId);
  }
  return { id: userId, nickname: getNickname(userId) };
}

function getNickname(userId) {
  const row = db.prepare('SELECT nickname FROM users WHERE id = ?').get(userId);
  return row ? row.nickname : '旅人';
}

// ---------- 旅程分享 ----------
function createShare(data) {
  const token = require('crypto').randomBytes(8).toString('hex');
  db.prepare(`
    INSERT INTO journey_shares (token, nickname, profile_name, aesthetic_dna, pre_score, return_score,
      improvement, pre_tags, return_tags, poetic_summary, checkin_places)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    token,
    data.nickname || '旅人',
    data.profile_name || '',
    data.aesthetic_dna || '',
    data.pre_score || 0,
    data.return_score || 0,
    data.improvement || 0,
    JSON.stringify(data.pre_tags || []),
    JSON.stringify(data.return_tags || []),
    data.poetic_summary || '',
    JSON.stringify(data.checkin_places || [])
  );
  return token;
}

function getShare(token) {
  const row = db.prepare('SELECT * FROM journey_shares WHERE token = ?').get(token);
  if (!row) return null;
  return {
    ...row,
    pre_tags: JSON.parse(row.pre_tags || '[]'),
    return_tags: JSON.parse(row.return_tags || '[]'),
    checkin_places: JSON.parse(row.checkin_places || '[]')
  };
}

// ---------- 用户上传场地 ----------
function addUserScene(data) {
  const info = db.prepare(`
    INSERT INTO user_scenes (user_id, name, type, description, coords, business_hours, price_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.user_id || '',
    data.name,
    data.type || '景点',
    data.description || '',
    data.coords || '117.21,29.28',
    data.business_hours || '全天',
    data.price_level || '中'
  );
  return Number(info.lastInsertRowid);
}

function listUserScenes() {
  return db.prepare('SELECT * FROM user_scenes WHERE status = ? ORDER BY created_at DESC').all('approved');
}

// ---------- 路线分享 ----------
function createSharedRoute(data) {
  const info = db.prepare(`
    INSERT INTO shared_routes (user_id, nickname, city, name, desc, scenes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.user_id || '',
    data.nickname || '旅人',
    data.city || 'jingdezhen',
    data.name,
    data.desc || '',
    JSON.stringify(data.scenes || [])
  );
  return Number(info.lastInsertRowid);
}

function listSharedRoutes(city) {
  const rows = city
    ? db.prepare('SELECT * FROM shared_routes WHERE city = ? ORDER BY likes DESC, created_at DESC').all(city)
    : db.prepare('SELECT * FROM shared_routes ORDER BY likes DESC, created_at DESC').all();
  return rows.map(r => ({ ...r, scenes: JSON.parse(r.scenes || '[]') }));
}

function likeSharedRoute(id) {
  db.prepare('UPDATE shared_routes SET likes = likes + 1 WHERE id = ?').run(id);
  return db.prepare('SELECT likes FROM shared_routes WHERE id = ?').get(id);
}

module.exports = {
  db,
  ensureUser,
  getNickname,
  createShare,
  getShare,
  addUserScene,
  listUserScenes,
  createSharedRoute,
  listSharedRoutes,
  likeSharedRoute
};
