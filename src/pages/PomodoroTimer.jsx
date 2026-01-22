import { useState, useEffect, useRef } from 'react'
import './PomodoroTimer.css'
import { Card, Button, Modal, Input } from '../components/index.js'
import pomodoroSettingsService from '../services/PomodoroSettingsService.js'

/**
 * ポモドーロタイマーページコンポーネント
 */
function PomodoroTimer() {
  const [settings, setSettings] = useState(null)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState(null)

  // タイマー状態
  const [timerState, setTimerState] = useState('idle') // idle, running, paused
  const [currentPhase, setCurrentPhase] = useState('work') // work, shortBreak, longBreak
  const [timeRemaining, setTimeRemaining] = useState(0) // 秒単位
  const [currentSession, setCurrentSession] = useState(1)
  const [completedSessions, setCompletedSessions] = useState(0)

  const intervalRef = useRef(null)
  const currentPhaseRef = useRef('work')
  const completedSessionsRef = useRef(0)

  // 設定を読み込む
  useEffect(() => {
    const loadedSettings = pomodoroSettingsService.get()
    setSettings(loadedSettings)
    setTimeRemaining(loadedSettings.sessionDuration * 60) // 分を秒に変換
  }, [])

  // currentPhaseとcompletedSessionsをrefに同期
  useEffect(() => {
    currentPhaseRef.current = currentPhase
  }, [currentPhase])

  useEffect(() => {
    completedSessionsRef.current = completedSessions
  }, [completedSessions])

  // タイマーのカウントダウン処理
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState])

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
        // 自動的に次のセッションを開始
        setTimerState('running')
      } else {
        // 休憩終了 → 作業へ
        setCurrentPhase('work')
        setTimeRemaining(settings.sessionDuration * 60)
        setCurrentSession((prev) => prev + 1)
        // 自動的に次のセッションを開始
        setTimerState('running')
      }
    }
  }, [timeRemaining, timerState, settings])

  // タイマー開始
  const handleStart = () => {
    setTimerState('running')
  }

  // タイマー一時停止
  const handlePause = () => {
    setTimerState('paused')
  }

  // タイマーリセット
  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimerState('idle')
    setCurrentPhase('work')
    setTimeRemaining(settings.sessionDuration * 60)
    setCurrentSession(1)
    setCompletedSessions(0)
  }

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

  // 時間を分:秒形式に変換
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 進捗率を計算
  const calculateProgress = () => {
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
  }

  // 状態表示テキスト
  const getPhaseText = () => {
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
  }

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
            <span className="phase-text">{getPhaseText()}</span>
          </div>

          {/* タイマー表示 */}
          <div className="pomodoro-timer-display">
            <div className="timer-time">{formatTime(timeRemaining)}</div>
          </div>

          {/* 進捗バー */}
          <div className="pomodoro-progress">
            <div
              className="progress-bar"
              style={{ width: `${calculateProgress()}%` }}
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
    </div>
  )
}

export default PomodoroTimer
