/**
 * Todoタスクモデル
 * @typedef {Object} TodoTask
 * @property {string} id - 一意のID
 * @property {string} title - タスク名
 * @property {string} createdAt - 作成日時（ISO 8601形式）
 * @property {string|null} dueDate - 期限日（ISO 8601形式、オプション）
 * @property {boolean} completed - 完了状態
 * @property {string|null} completedAt - 完了日時（ISO 8601形式、オプション）
 */

/**
 * Todoタスクを作成する
 * @param {Object} data - タスクデータ
 * @param {string} data.title - タスク名
 * @param {string|null} [data.dueDate] - 期限日
 * @returns {TodoTask}
 */
export function createTodoTask(data) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: data.title,
    createdAt: now,
    dueDate: data.dueDate || null,
    completed: false,
    completedAt: null,
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
  createTodoTask,
}
