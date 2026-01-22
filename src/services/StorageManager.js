/**
 * ストレージ管理モジュール
 * LocalStorageを使用してデータの永続化を行う
 */

const STORAGE_KEYS = {
  TODOS: 'focus_app_todos',
  JOURNALS: 'focus_app_journals',
  TROPHIES: 'focus_app_trophies',
  ACQUIRED_TROPHIES: 'focus_app_acquired_trophies',
  POMODORO_SETTINGS: 'focus_app_pomodoro_settings',
}

/**
 * LocalStorageからデータを取得する
 * @param {string} key - ストレージキー
 * @returns {any|null} 取得したデータ、存在しない場合はnull
 */
function getItem(key) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error getting item from localStorage (${key}):`, error)
    return null
  }
}

/**
 * LocalStorageにデータを保存する
 * @param {string} key - ストレージキー
 * @param {any} value - 保存するデータ
 * @returns {boolean} 成功した場合true
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error setting item to localStorage (${key}):`, error)
    return false
  }
}

/**
 * LocalStorageからデータを削除する
 * @param {string} key - ストレージキー
 * @returns {boolean} 成功した場合true
 */
function removeItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing item from localStorage (${key}):`, error)
    return false
  }
}

/**
 * LocalStorageのすべてのデータをクリアする
 * @returns {boolean} 成功した場合true
 */
function clear() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

/**
 * Todoタスクの保存・取得
 */
export const todoStorage = {
  getAll: () => getItem(STORAGE_KEYS.TODOS) || [],
  save: (todos) => setItem(STORAGE_KEYS.TODOS, todos),
  clear: () => removeItem(STORAGE_KEYS.TODOS),
}

/**
 * ジャーナルエントリーの保存・取得
 */
export const journalStorage = {
  getAll: () => getItem(STORAGE_KEYS.JOURNALS) || [],
  save: (journals) => setItem(STORAGE_KEYS.JOURNALS, journals),
  clear: () => removeItem(STORAGE_KEYS.JOURNALS),
}

/**
 * トロフィーの保存・取得
 */
export const trophyStorage = {
  getAll: () => getItem(STORAGE_KEYS.TROPHIES) || [],
  save: (trophies) => setItem(STORAGE_KEYS.TROPHIES, trophies),
  clear: () => removeItem(STORAGE_KEYS.TROPHIES),
}

/**
 * 獲得済みトロフィーの保存・取得
 */
export const acquiredTrophyStorage = {
  getAll: () => getItem(STORAGE_KEYS.ACQUIRED_TROPHIES) || [],
  save: (acquiredTrophies) =>
    setItem(STORAGE_KEYS.ACQUIRED_TROPHIES, acquiredTrophies),
  clear: () => removeItem(STORAGE_KEYS.ACQUIRED_TROPHIES),
}

/**
 * ポモドーロ設定の保存・取得
 */
export const pomodoroSettingsStorage = {
  get: () => getItem(STORAGE_KEYS.POMODORO_SETTINGS),
  save: (settings) => setItem(STORAGE_KEYS.POMODORO_SETTINGS, settings),
  clear: () => removeItem(STORAGE_KEYS.POMODORO_SETTINGS),
}

/**
 * すべてのデータをクリアする
 */
export function clearAllData() {
  return clear()
}

export default {
  todoStorage,
  journalStorage,
  trophyStorage,
  acquiredTrophyStorage,
  pomodoroSettingsStorage,
  clearAllData,
}
