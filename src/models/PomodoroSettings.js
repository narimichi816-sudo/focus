/**
 * ポモドーロ設定モデル
 * @typedef {Object} PomodoroSettings
 * @property {number} sessionDuration - 作業時間（分）
 * @property {number} shortBreakDuration - 短休憩時間（分）
 * @property {number} longBreakDuration - 長休憩時間（分）
 * @property {number} sessionsUntilLongBreak - 長休憩までのセッション数
 * @property {number} totalSessions - 繰り返し回数
 */

/**
 * デフォルトのポモドーロ設定を作成する
 * @returns {PomodoroSettings}
 */
export function createDefaultPomodoroSettings() {
  return {
    sessionDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    totalSessions: 4,
  }
}

/**
 * ポモドーロ設定を作成する
 * @param {Object} data - 設定データ
 * @param {number} [data.sessionDuration=25] - 作業時間（分）
 * @param {number} [data.shortBreakDuration=5] - 短休憩時間（分）
 * @param {number} [data.longBreakDuration=15] - 長休憩時間（分）
 * @param {number} [data.sessionsUntilLongBreak=4] - 長休憩までのセッション数
 * @param {number} [data.totalSessions=4] - 繰り返し回数
 * @returns {PomodoroSettings}
 */
export function createPomodoroSettings(data = {}) {
  const defaults = createDefaultPomodoroSettings()
  return {
    sessionDuration: data.sessionDuration ?? defaults.sessionDuration,
    shortBreakDuration: data.shortBreakDuration ?? defaults.shortBreakDuration,
    longBreakDuration: data.longBreakDuration ?? defaults.longBreakDuration,
    sessionsUntilLongBreak:
      data.sessionsUntilLongBreak ?? defaults.sessionsUntilLongBreak,
    totalSessions: data.totalSessions ?? defaults.totalSessions,
  }
}

export default {
  createDefaultPomodoroSettings,
  createPomodoroSettings,
}
