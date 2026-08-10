// 心旅 AI — JSON 文件持久化 Session Store
// 继承 express-session Store，将会话数据持久化到文件系统

const fs = require('fs');
const path = require('path');
const session = require('express-session');
const Store = session.Store;

const SESSION_DIR = path.join(__dirname, '..', 'data', 'sessions');

// 确保 sessions 目录存在
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

class JsonSessionStore extends Store {
  /**
   * 读取 session 数据
   */
  get(sid, callback) {
    const filePath = path.join(SESSION_DIR, `${sid}.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return callback(null, null);
        }
        return callback(err);
      }

      try {
        const sessionData = JSON.parse(data);
        callback(null, sessionData);
      } catch (parseErr) {
        callback(parseErr);
      }
    });
  }

  /**
   * 写入 session 数据
   */
  set(sid, sessionData, callback) {
    const filePath = path.join(SESSION_DIR, `${sid}.json`);

    try {
      const data = JSON.stringify(sessionData, null, 2);
      fs.writeFile(filePath, data, 'utf8', (err) => {
        if (callback) callback(err);
      });
    } catch (err) {
      if (callback) callback(err);
    }
  }

  /**
   * 销毁 session
   */
  destroy(sid, callback) {
    const filePath = path.join(SESSION_DIR, `${sid}.json`);

    fs.unlink(filePath, (err) => {
      if (err && err.code === 'ENOENT') {
        return callback(null);
      }
      if (callback) callback(err);
    });
  }

  /**
   * 触碰 session（延长过期时间，文件存储版无需操作）
   */
  touch(sid, sessionData, callback) {
    if (callback) callback(null);
  }
}

module.exports = JsonSessionStore;
