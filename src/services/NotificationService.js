import { notificationSettingsStorage } from './StorageManager.js'

/**
 * 通知設定のデフォルト値
 */
const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  sessionEnd: true,
  breakEnd: true,
  soundEnabled: false,
}

/**
 * 通知管理サービス
 * Web Notifications APIを使用してブラウザ通知を管理する
 */
class NotificationService {
  constructor() {
    this.permission = null
    this.settings = null
    this.init()
  }

  /**
   * 初期化処理
   */
  init() {
    // ブラウザが通知をサポートしているか確認
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません')
      return
    }

    this.permission = Notification.permission
    this.loadSettings()
  }

  /**
   * 通知設定を読み込む
   */
  loadSettings() {
    const savedSettings = notificationSettingsStorage.get()
    this.settings = savedSettings || { ...DEFAULT_NOTIFICATION_SETTINGS }
    if (!savedSettings) {
      this.saveSettings()
    }
  }

  /**
   * 通知設定を保存する
   */
  saveSettings() {
    notificationSettingsStorage.save(this.settings)
  }

  /**
   * 通知設定を取得する
   * @returns {Object} 通知設定
   */
  getSettings() {
    return { ...this.settings }
  }

  /**
   * 通知設定を更新する
   * @param {Object} newSettings - 更新する設定
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
  }

  /**
   * 通知が有効かどうかを確認
   * @returns {boolean}
   */
  isEnabled() {
    return this.settings?.enabled === true
  }

  /**
   * セッション終了通知が有効かどうかを確認
   * @returns {boolean}
   */
  isSessionEndEnabled() {
    return this.isEnabled() && this.settings?.sessionEnd === true
  }

  /**
   * 休憩終了通知が有効かどうかを確認
   * @returns {boolean}
   */
  isBreakEndEnabled() {
    return this.isEnabled() && this.settings?.breakEnd === true
  }

  /**
   * 音声通知が有効かどうかを確認
   * @returns {boolean}
   */
  isSoundEnabled() {
    return this.settings?.soundEnabled === true
  }

  /**
   * ブラウザ通知の許可をリクエストする
   * @returns {Promise<string>} 許可状態（granted, denied, default）
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return 'unsupported'
    }

    if (this.permission === 'granted') {
      return 'granted'
    }

    if (this.permission === 'denied') {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission
    } catch (error) {
      console.error('通知の許可リクエストでエラーが発生しました:', error)
      return 'denied'
    }
  }

  /**
   * 通知を表示する
   * @param {string} title - 通知のタイトル
   * @param {Object} options - 通知のオプション
   */
  async showNotification(title, options = {}) {
    if (!this.isEnabled()) {
      return
    }

    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません')
      return
    }

    // 許可されていない場合はリクエスト
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        console.warn('通知の許可が得られませんでした')
        return
      }
    }

    try {
      const notification = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'pomodoro-notification',
        requireInteraction: options.requireInteraction || false,
        silent: !this.isSoundEnabled(),
        ...options,
      })

      // 通知を自動的に閉じる（オプション）
      if (options.autoClose !== false) {
        setTimeout(() => {
          notification.close()
        }, options.duration || 5000)
      }

      // クリック時の処理
      if (options.onClick) {
        notification.onclick = options.onClick
      }

      return notification
    } catch (error) {
      console.error('通知の表示でエラーが発生しました:', error)
    }
  }

  /**
   * セッション終了通知を表示する
   */
  async notifySessionEnd() {
    if (!this.isSessionEndEnabled()) {
      return
    }

    return this.showNotification('作業セッションが完了しました', {
      body: 'お疲れ様でした！休憩時間です。',
      tag: 'session-end',
      requireInteraction: false,
    })
  }

  /**
   * 休憩終了通知を表示する
   * @param {string} breakType - 休憩の種類（shortBreak, longBreak）
   */
  async notifyBreakEnd(breakType = 'shortBreak') {
    if (!this.isBreakEndEnabled()) {
      return
    }

    const breakTypeText = breakType === 'longBreak' ? '長休憩' : '短休憩'
    return this.showNotification(`${breakTypeText}が終了しました`, {
      body: '作業を再開しましょう！',
      tag: 'break-end',
      requireInteraction: false,
    })
  }

  /**
   * 通知の許可状態を取得する
   * @returns {string} granted, denied, default, unsupported
   */
  getPermission() {
    if (!('Notification' in window)) {
      return 'unsupported'
    }
    return Notification.permission
  }

  /**
   * 通知が許可されているかどうかを確認
   * @returns {boolean}
   */
  isPermissionGranted() {
    return this.getPermission() === 'granted'
  }
}

export default new NotificationService()
