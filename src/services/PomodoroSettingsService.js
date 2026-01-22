import { pomodoroSettingsStorage } from './StorageManager.js'
import {
  createDefaultPomodoroSettings,
  createPomodoroSettings,
} from '../models/PomodoroSettings.js'

/**
 * ポモドーロ設定サービス
 * ポモドーロ設定の管理を提供する
 */
class PomodoroSettingsService {
  /**
   * ポモドーロ設定を取得する
   * 設定が存在しない場合はデフォルト設定を返す
   * @returns {PomodoroSettings}
   */
  get() {
    const settings = pomodoroSettingsStorage.get()
    if (settings) {
      return settings
    }
    // デフォルト設定を返し、保存する
    const defaultSettings = createDefaultPomodoroSettings()
    this.save(defaultSettings)
    return defaultSettings
  }

  /**
   * ポモドーロ設定を保存する
   * @param {Object} data - 設定データ
   * @returns {PomodoroSettings}
   */
  save(data) {
    const settings = createPomodoroSettings(data)
    pomodoroSettingsStorage.save(settings)
    return settings
  }

  /**
   * ポモドーロ設定を更新する
   * @param {Object} data - 更新データ（部分的な更新も可能）
   * @returns {PomodoroSettings}
   */
  update(data) {
    const currentSettings = this.get()
    const updatedSettings = { ...currentSettings, ...data }
    return this.save(updatedSettings)
  }

  /**
   * ポモドーロ設定をリセットする（デフォルト値に戻す）
   * @returns {PomodoroSettings}
   */
  reset() {
    const defaultSettings = createDefaultPomodoroSettings()
    return this.save(defaultSettings)
  }
}

export default new PomodoroSettingsService()
