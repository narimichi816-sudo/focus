import { pomodoroSettingsStorage, notificationSettingsStorage } from '../services/StorageManager.js'
import { createDefaultPomodoroSettings } from '../models/PomodoroSettings.js'
import notificationService from '../services/NotificationService.js'
import trophyService from '../services/TrophyService.js'
import trophyChallengeService from '../services/TrophyChallengeService.js'
import trophiesData from '../data/trophies.json'

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
  initializeNotificationSettings()
  initializeTrophies()
  initializeTrophyChallenge()
  // 他のデータ（Todo、ジャーナル等）は
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
 * 通知設定を初期化する
 * 設定が存在しない場合、デフォルト設定を保存する
 * @returns {void}
 */
export function initializeNotificationSettings() {
  // NotificationServiceが自動的に初期化するため、ここでは何もしない
  // ただし、明示的に初期化を確認する
  notificationService.loadSettings()
}

/**
 * トロフィーデータを初期化する
 * トロフィーが存在しない場合、JSONファイルから読み込んで保存する
 * @returns {void}
 */
export function initializeTrophies() {
  const existingTrophies = trophyService.getAll()
  
  // 既にトロフィーが存在する場合は初期化しない
  if (existingTrophies.length > 0) {
    return
  }

  // JSONファイルからトロフィーデータを読み込んで保存
  trophyService.createMany(trophiesData)
}

/**
 * トロフィーチャレンジを初期化する
 * 日付変更時の処理も含む
 * @returns {void}
 */
export function initializeTrophyChallenge() {
  // 日付変更時の処理（前日のチャレンジをクリア）
  trophyChallengeService.handleDateChange()
  
  // 今日のチャレンジを取得または生成
  trophyChallengeService.getTodayChallenge()
}

/**
 * ストレージの状態を確認する
 * @returns {Object} 各ストレージの状態
 */
export function checkStorageStatus() {
  return {
    pomodoroSettings: pomodoroSettingsStorage.get() !== null,
    notificationSettings: notificationSettingsStorage.get() !== null,
    trophies: trophyService.getAll().length > 0,
  }
}

export default {
  initializeAllData,
  initializePomodoroSettings,
  initializeTrophies,
  initializeTrophyChallenge,
  checkStorageStatus,
}
