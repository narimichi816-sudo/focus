/**
 * ジャーナルエントリーモデル
 * @typedef {Object} JournalEntry
 * @property {string} id - 一意のID
 * @property {string} content - ジャーナルの内容
 * @property {string} createdAt - 作成日時（ISO 8601形式）
 * @property {string} updatedAt - 更新日時（ISO 8601形式）
 */

/**
 * ジャーナルエントリーを作成する
 * @param {Object} data - ジャーナルデータ
 * @param {string} data.content - ジャーナルの内容
 * @returns {JournalEntry}
 */
export function createJournalEntry(data) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    content: data.content,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * ジャーナルエントリーを更新する
 * @param {JournalEntry} entry - 既存のジャーナルエントリー
 * @param {Object} data - 更新データ
 * @param {string} data.content - ジャーナルの内容
 * @returns {JournalEntry}
 */
export function updateJournalEntry(entry, data) {
  return {
    ...entry,
    content: data.content,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * 一意のIDを生成する
 * @returns {string}
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default {
  createJournalEntry,
  updateJournalEntry,
}
