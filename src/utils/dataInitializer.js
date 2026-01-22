import { pomodoroSettingsStorage } from '../services/StorageManager.js'
import { createDefaultPomodoroSettings } from '../models/PomodoroSettings.js'

/**
 * データ初期化処理
 * アプリケーション起動時に必要なデータを初期化する
 */

/**
 * すべてのデータを初期化する
 * @returns {void}
 */
export function initializeAllData() {
  initializePomodoroSettings()
  // 他のデータ（Todo、ジャーナル、トロフィー等）は
  // ユーザーが作成するため、初期化は不要
}

/**
 * ポモドーロ設定を初期化する
 * 設定が存在しない場合、デフォルト設定を保存する
 * @returns {void}
 */
export function initializePomodoroSettings() {
  const settings = pomodoroSettingsStorage.get()
  if (!settings) {
    const defaultSettings = createDefaultPomodoroSettings()
    pomodoroSettingsStorage.save(defaultSettings)
  }
}

/**
 * ストレージの状態を確認する
 * @returns {Object} 各ストレージの状態
 */
export function checkStorageStatus() {
  return {
    pomodoroSettings: pomodoroSettingsStorage.get() !== null,
  }
}

export default {
  initializeAllData,
  initializePomodoroSettings,
  checkStorageStatus,
}
