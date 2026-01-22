import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './PomodoroTimer.css'
import { Card, Button, Modal, Input } from '../components/index.js'
import pomodoroSettingsService from '../services/PomodoroSettingsService.js'
import notificationService from '../services/NotificationService.js'

/**
 * ポモドーロタイマーページコンポーネント
 */
function PomodoroTimer() {
  const [settings, setSettings] = useState(null)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState(null)
  const [isNotificationSettingsModalOpen, setIsNotificationSettingsModalOpen] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState(null)
  const [tempNotificationSettings, setTempNotificationSettings] = useState(null)

  // タイマー状態
  const [timerState, setTimerState] = useState('idle') // idle, running, paused
  const [currentPhase, setCurrentPhase] = useState('work') // work, shortBreak, longBreak
  const [timeRemaining, setTimeRemaining] = useState(0) // 秒単位
  const [currentSession, setCurrentSession] = useState(1)
  const [completedSessions, setCompletedSessions] = useState(0)

  const intervalRef = useRef(null)
  const currentPhaseRef = useRef('work')
  const completedSessionsRef = useRef(0)
  const startTimeRef = useRef(null) // タイマー開始時刻
  const expectedEndTimeRef = useRef(null) // タイマー終了予定時刻

  // 設定を読み込む
  useEffect(() => {
    const loadedSettings = pomodoroSettingsService.get()
    setSettings(loadedSettings)
    setTimeRemaining(loadedSettings.sessionDuration * 60) // 分を秒に変換

    // 通知設定を読み込む
    const loadedNotificationSettings = notificationService.getSettings()
    setNotificationSettings(loadedNotificationSettings)
  }, [])

  // 通知の許可をリクエスト（初回のみ）
  useEffect(() => {
    if (notificationService.getPermission() === 'default') {
      // ユーザーが明示的に許可をリクエストするまで待つ
      // 通知設定モーダルでリクエストする
    }
  }, [])

  // currentPhaseとcompletedSessionsをrefに同期
  useEffect(() => {
    currentPhaseRef.current = currentPhase
  }, [currentPhase])

  useEffect(() => {
    completedSessionsRef.current = completedSessions
  }, [completedSessions])

  // timerStateが'running'になった時にexpectedEndTimeRefを初期化
  useEffect(() => {
    if (timerState === 'running' && (!startTimeRef.current || !expectedEndTimeRef.current)) {
      startTimeRef.current = Date.now()
      expectedEndTimeRef.current = startTimeRef.current + (timeRemaining * 1000)
    }
  }, [timerState]) // timerStateのみを依存配列に（無限ループを防止）

  // タイマーのカウントダウン処理（高精度版）
  useEffect(() => {
    if (timerState === 'running') {

      // 高精度タイマー: Dateオブジェクトを使用して正確な時間を計算
      intervalRef.current = setInterval(() => {
        if (!expectedEndTimeRef.current) return
        
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((expectedEndTimeRef.current - now) / 1000))

        if (remaining <= 0) {
          setTimeRemaining(0)
          // タイマー終了時の処理は別のuseEffectで処理
        } else {
          setTimeRemaining(remaining)
        }
      }, 100) // 100msごとに更新して滑らかに表示

      // ページがバックグラウンドから復帰した時の補正
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && timerState === 'running') {
          const now = Date.now()
          if (expectedEndTimeRef.current) {
            const remaining = Math.max(0, Math.floor((expectedEndTimeRef.current - now) / 1000))
            setTimeRemaining(remaining)
          }
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    } else {
      // タイマーが停止または一時停止された時
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (timerState === 'paused') {
        // 一時停止時は開始時刻をリセット（再開時に再計算）
        startTimeRef.current = null
        expectedEndTimeRef.current = null
      } else if (timerState === 'idle') {
        // リセット時は完全にクリア
        startTimeRef.current = null
        expectedEndTimeRef.current = null
      }
    }
  }, [timerState]) // timerStateのみを依存配列に

  // タイマーが0になった時の処理
  useEffect(() => {
    if (timerState === 'running' && timeRemaining === 0 && settings) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      const phase = currentPhaseRef.current
      const completed = completedSessionsRef.current

      if (phase === 'work') {
        // 作業セッション完了
        const newCompletedSessions = completed + 1

        // セッション終了通知
        notificationService.notifySessionEnd()

        // 全セッション完了の判定
        if (newCompletedSessions >= settings.totalSessions) {
          setTimerState('idle')
          setCurrentSession(1)
          setCompletedSessions(0)
          setCurrentPhase('work')
          setTimeRemaining(settings.sessionDuration * 60)
          return
        }

        // 長休憩の判定
        if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
          // 長休憩へ
          setCurrentPhase('longBreak')
          setTimeRemaining(settings.longBreakDuration * 60)
        } else {
          // 短休憩へ
          setCurrentPhase('shortBreak')
          setTimeRemaining(settings.shortBreakDuration * 60)
        }

        setCompletedSessions(newCompletedSessions)
        // 自動的に次のセッションを開始（開始時刻をリセット）
        startTimeRef.current = null
        expectedEndTimeRef.current = null
        // 状態更新後にタイマーを開始
        setTimerState('running')
      } else {
        // 休憩終了 → 作業へ
        // 休憩終了通知
        notificationService.notifyBreakEnd(phase)

        setCurrentPhase('work')
        setTimeRemaining(settings.sessionDuration * 60)
        setCurrentSession((prev) => prev + 1)
        // 自動的に次のセッションを開始（開始時刻をリセット）
        startTimeRef.current = null
        expectedEndTimeRef.current = null
        // 状態更新後にタイマーを開始
        setTimerState('running')
      }
    }
  }, [timeRemaining, timerState, settings])


  // 設定モーダルを開く
  const handleOpenSettings = () => {
    setTempSettings({ ...settings })
    setIsSettingsModalOpen(true)
  }

  // 設定を保存
  const handleSaveSettings = () => {
    const updatedSettings = pomodoroSettingsService.save(tempSettings)
    setSettings(updatedSettings)
    setIsSettingsModalOpen(false)

    // タイマーが停止中の場合、新しい設定でリセット
    if (timerState === 'idle') {
      setTimeRemaining(updatedSettings.sessionDuration * 60)
      setCurrentPhase('work')
      setCurrentSession(1)
      setCompletedSessions(0)
    }
  }

  // 設定をキャンセル
  const handleCancelSettings = () => {
    setIsSettingsModalOpen(false)
    setTempSettings(null)
  }

  // 通知設定モーダルを開く
  const handleOpenNotificationSettings = () => {
    setTempNotificationSettings({ ...notificationSettings })
    setIsNotificationSettingsModalOpen(true)
  }

  // 通知設定を保存
  const handleSaveNotificationSettings = () => {
    notificationService.updateSettings(tempNotificationSettings)
    setNotificationSettings({ ...tempNotificationSettings })
    setIsNotificationSettingsModalOpen(false)
  }

  // 通知設定をキャンセル
  const handleCancelNotificationSettings = () => {
    setIsNotificationSettingsModalOpen(false)
    setTempNotificationSettings(null)
  }

  // 通知の許可をリクエスト
  const handleRequestNotificationPermission = async () => {
    const permission = await notificationService.requestPermission()
    if (permission === 'granted') {
      // 許可された場合、通知設定を更新
      setTempNotificationSettings((prev) => ({
        ...prev,
        enabled: true,
      }))
    }
    return permission
  }

  // 時間を分:秒形式に変換（useMemoでメモ化）
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeRemaining / 60)
    const secs = timeRemaining % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [timeRemaining])

  // 進捗率を計算（useMemoでメモ化）
  const progress = useMemo(() => {
    if (!settings) return 0

    let totalTime = 0
    if (currentPhase === 'work') {
      totalTime = settings.sessionDuration * 60
    } else if (currentPhase === 'shortBreak') {
      totalTime = settings.shortBreakDuration * 60
    } else {
      totalTime = settings.longBreakDuration * 60
    }

    return ((totalTime - timeRemaining) / totalTime) * 100
  }, [settings, currentPhase, timeRemaining])

  // 状態表示テキスト（useMemoでメモ化）
  const phaseText = useMemo(() => {
    switch (currentPhase) {
      case 'work':
        return '作業中'
      case 'shortBreak':
        return '短休憩中'
      case 'longBreak':
        return '長休憩中'
      default:
        return ''
    }
  }, [currentPhase])

  // ハンドラー関数をuseCallbackでメモ化
  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now()
    expectedEndTimeRef.current = startTimeRef.current + (timeRemaining * 1000)
    setTimerState('running')
  }, [timeRemaining])

  const handlePause = useCallback(() => {
    setTimerState('paused')
  }, [])

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    expectedEndTimeRef.current = null
    setTimerState('idle')
    setCurrentPhase('work')
    setTimeRemaining(settings.sessionDuration * 60)
    setCurrentSession(1)
    setCompletedSessions(0)
  }, [settings])

  if (!settings) {
    return (
      <div className="pomodoro-timer">
        <Card title="ポモドーロタイマー">
          <p>読み込み中...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="pomodoro-timer">
      <Card
        title="ポモドーロタイマー"
        className="pomodoro-timer-card"
      >
        <div className="pomodoro-timer-content">
          {/* セッション情報 */}
          <div className="pomodoro-session-info">
            <div className="session-counter">
              セッション {currentSession}/{settings.totalSessions}
            </div>
            <div className="completed-sessions">
              完了: {completedSessions}/{settings.totalSessions}
            </div>
          </div>

          {/* 状態表示 */}
          <div className="pomodoro-phase">
            <span className="phase-text">{phaseText}</span>
          </div>

          {/* タイマー表示 */}
          <div className="pomodoro-timer-display">
            <div className="timer-time">{formattedTime}</div>
          </div>

          {/* 進捗バー */}
          <div className="pomodoro-progress">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* コントロールボタン */}
          <div className="pomodoro-controls">
            {timerState === 'running' ? (
              <Button variant="secondary" onClick={handlePause}>
                一時停止
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStart} disabled={timerState === 'idle' && timeRemaining === 0}>
                開始
              </Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              リセット
            </Button>
            <Button variant="outline" onClick={handleOpenSettings}>
              設定
            </Button>
            <Button variant="outline" onClick={handleOpenNotificationSettings}>
              通知設定
            </Button>
          </div>
        </div>
      </Card>

      {/* 設定モーダル */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={handleCancelSettings}
        title="ポモドーロ設定"
      >
        {tempSettings && (
          <div className="pomodoro-settings-form">
            <div className="settings-field">
              <Input
                type="number"
                label="繰り返し回数"
                value={tempSettings.totalSessions}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    totalSessions: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                required
              />
            </div>

            <div className="settings-field">
              <Input
                type="number"
                label="作業時間（分）"
                value={tempSettings.sessionDuration}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    sessionDuration: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                required
              />
            </div>

            <div className="settings-field">
              <Input
                type="number"
                label="短休憩時間（分）"
                value={tempSettings.shortBreakDuration}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    shortBreakDuration: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                required
              />
            </div>

            <div className="settings-field">
              <Input
                type="number"
                label="長休憩時間（分）"
                value={tempSettings.longBreakDuration}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    longBreakDuration: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                required
              />
            </div>

            <div className="settings-field">
              <Input
                type="number"
                label="長休憩のタイミング（セッション数）"
                value={tempSettings.sessionsUntilLongBreak}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    sessionsUntilLongBreak: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                required
              />
            </div>

            <div className="settings-actions">
              <Button variant="primary" onClick={handleSaveSettings}>
                保存
              </Button>
              <Button variant="secondary" onClick={handleCancelSettings}>
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 通知設定モーダル */}
      <Modal
        isOpen={isNotificationSettingsModalOpen}
        onClose={handleCancelNotificationSettings}
        title="通知設定"
      >
        {tempNotificationSettings && (
          <div className="pomodoro-settings-form">
            <div className="settings-field">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={tempNotificationSettings.enabled || false}
                    onChange={(e) =>
                      setTempNotificationSettings({
                        ...tempNotificationSettings,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  <span>通知を有効にする</span>
                </label>
              </div>
            </div>

            {tempNotificationSettings.enabled && (
              <>
                <div className="settings-field">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempNotificationSettings.sessionEnd !== false}
                        onChange={(e) =>
                          setTempNotificationSettings({
                            ...tempNotificationSettings,
                            sessionEnd: e.target.checked,
                          })
                        }
                      />
                      <span>セッション終了時に通知</span>
                    </label>
                  </div>
                </div>

                <div className="settings-field">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempNotificationSettings.breakEnd !== false}
                        onChange={(e) =>
                          setTempNotificationSettings({
                            ...tempNotificationSettings,
                            breakEnd: e.target.checked,
                          })
                        }
                      />
                      <span>休憩終了時に通知</span>
                    </label>
                  </div>
                </div>

                <div className="settings-field">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={tempNotificationSettings.soundEnabled || false}
                        onChange={(e) =>
                          setTempNotificationSettings({
                            ...tempNotificationSettings,
                            soundEnabled: e.target.checked,
                          })
                        }
                      />
                      <span>音声通知を有効にする</span>
                    </label>
                  </div>
                </div>

                {notificationService.getPermission() !== 'granted' && (
                  <div className="settings-field">
                    <div className="notification-permission-info">
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
                        ブラウザ通知を使用するには、通知の許可が必要です。
                      </p>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={handleRequestNotificationPermission}
                      >
                        通知の許可をリクエスト
                      </Button>
                    </div>
                  </div>
                )}

                {notificationService.getPermission() === 'granted' && (
                  <div className="settings-field">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#4caf50' }}>
                      ✓ 通知の許可が得られています
                    </p>
                  </div>
                )}

                {notificationService.getPermission() === 'denied' && (
                  <div className="settings-field">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#f44336' }}>
                      ⚠ 通知が拒否されています。ブラウザの設定から許可してください。
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="settings-actions">
              <Button variant="primary" onClick={handleSaveNotificationSettings}>
                保存
              </Button>
              <Button variant="secondary" onClick={handleCancelNotificationSettings}>
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PomodoroTimer
