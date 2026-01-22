import { useState, useEffect } from 'react'
import trophyChallengeService from '../services/TrophyChallengeService.js'
import todoService from '../services/TodoService.js'
import { todoStorage } from '../services/StorageManager.js'
import { Card, Button } from '../components/index.js'
import './TrophyChallenge.css'

/**
 * トロフィーチャレンジページコンポーネント
 */
function TrophyChallenge() {
  const [challenge, setChallenge] = useState(null)
  const [condition, setCondition] = useState(null)
  const [isAcquired, setIsAcquired] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showTestTools, setShowTestTools] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isResetting, setIsResetting] = useState(false) // リセット中フラグ

  useEffect(() => {
    loadChallenge()
    checkCondition()
  }, [])

  // Todoタスクの変更を監視して条件を再チェック
  useEffect(() => {
    if (isAcquired || isResetting) {
      return // 既に獲得済みの場合、またはリセット中の場合はチェックしない
    }

    const interval = setInterval(() => {
      // 最新のisAcquired状態を確認
      const currentIsAcquired = trophyChallengeService.isTodayChallengeAcquired()
      if (!currentIsAcquired && !isResetting) {
        checkCondition()
      }
    }, 2000) // 2秒ごとにチェック

    return () => clearInterval(interval)
  }, [isAcquired, isResetting])

  /**
   * チャレンジを読み込む
   */
  const loadChallenge = () => {
    const todayChallenge = trophyChallengeService.getTodayChallenge()
    setChallenge(todayChallenge)
    setIsAcquired(trophyChallengeService.isTodayChallengeAcquired())
    setImageError(false) // チャレンジを読み込む際にエラー状態をリセット
  }

  /**
   * 獲得条件をチェックする
   * @param {boolean} skipAutoAcquire - 自動獲得をスキップするかどうか（リセット後など）
   */
  const checkCondition = (skipAutoAcquire = false) => {
    // リセット中の場合はチェックしない
    if (isResetting) {
      return
    }

    // 最新の獲得状態を確認
    const currentIsAcquired = trophyChallengeService.isTodayChallengeAcquired()
    if (currentIsAcquired) {
      setIsAcquired(true)
      return // 既に獲得済みの場合はチェックしない
    }

    const conditionResult = trophyChallengeService.checkAcquisitionCondition()
    setCondition(conditionResult)

    // 条件を満たした場合、自動的に獲得処理を実行
    // ただし、既に獲得済みでないこと、リセット中でないこと、自動獲得をスキップしないことを確認
    if (conditionResult.isEligible && !currentIsAcquired && !skipAutoAcquire && !isResetting) {
      handleAcquire()
    }
  }

  /**
   * トロフィーを獲得する
   */
  const handleAcquire = () => {
    // 既に獲得済みの場合は何もしない
    if (isAcquired) {
      return
    }

    const result = trophyChallengeService.acquireTrophy()

    if (result) {
      setIsAcquired(true)
      setShowAnimation(true)

      // アニメーションを3秒後に非表示にする
      setTimeout(() => {
        setShowAnimation(false)
      }, 3000)

      // 通知を表示（必要に応じて）
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('トロフィー獲得！', {
          body: `${result.challenge.trophy.name}を獲得しました！`,
          icon: result.challenge.trophy.image,
        })
      }

      // 条件を更新（再チェックは不要、獲得済みなので）
      const conditionResult = trophyChallengeService.checkAcquisitionCondition()
      setCondition(conditionResult)
    }
  }

  /**
   * テスト用: テストタスクを作成する
   */
  const handleCreateTestTask = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // 2日前の日付を計算
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    twoDaysAgo.setHours(12, 0, 0, 0) // 時刻を設定

    try {
      // タスクを作成（期限日は今日の23:59:59に設定してバリデーションエラーを回避）
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)
      const task = todoService.create({
        title: `テストタスク ${new Date().toLocaleTimeString('ja-JP')}`,
        dueDate: todayEnd.toISOString(),
      })

      // 作成日時を2日前に変更（ストレージを直接操作）
      const todos = todoService.getAll()
      const taskIndex = todos.findIndex((t) => t.id === task.id)
      if (taskIndex !== -1) {
        todos[taskIndex].createdAt = twoDaysAgo.toISOString()
        // ストレージに直接保存
        todoStorage.save(todos)
      }

      // 条件を再チェック
      setTimeout(() => {
        checkCondition()
        loadChallenge()
      }, 100)

      alert('テストタスクを作成しました！')
    } catch (error) {
      alert(`エラー: ${error.message}`)
    }
  }

  /**
   * テスト用: 対象タスクをすべて完了にする
   */
  const handleCompleteEligibleTasks = () => {
    const eligibleTasks = trophyChallengeService.getEligibleTasks()
    const incompleteTasks = eligibleTasks.filter((task) => !task.completed)

    if (incompleteTasks.length === 0) {
      alert('完了するタスクがありません。')
      return
    }

    incompleteTasks.forEach((task) => {
      todoService.update(task.id, { completed: true })
    })

    // 条件を再チェック
    setTimeout(() => {
      checkCondition()
    }, 100)

    alert(`${incompleteTasks.length}個のタスクを完了しました！`)
  }

  /**
   * テスト用: トロフィーを強制的に獲得する
   */
  const handleForceAcquire = () => {
    const result = trophyChallengeService.forceAcquireTrophy()

    if (result) {
      setIsAcquired(true)
      setShowAnimation(true)

      setTimeout(() => {
        setShowAnimation(false)
      }, 3000)

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('トロフィー獲得！', {
          body: `${result.challenge.trophy.name}を獲得しました！`,
          icon: result.challenge.trophy.image,
        })
      }

      checkCondition()
      loadChallenge()
    }
  }

  /**
   * テスト用: チャレンジの獲得状態をリセットする
   */
  const handleResetChallenge = () => {
    if (confirm('チャレンジの獲得状態をリセットしますか？')) {
      // リセット中フラグを設定（自動チェックを無効化）
      setIsResetting(true)
      
      const success = trophyChallengeService.resetChallengeAcquisition()
      
      if (success) {
        // 状態をリセット
        setIsAcquired(false)
        setShowAnimation(false)
        
        // ストレージの更新が確実に反映されるように、少し待ってから再読み込み
        setTimeout(() => {
          // チャレンジを再読み込み（獲得状態を更新）
          // リセット後の状態を確実に反映するため、明示的に状態を更新
          const todayChallenge = trophyChallengeService.getTodayChallenge()
          setChallenge(todayChallenge)
          
          // 獲得状態を再確認（ストレージから最新の状態を取得）
          const isAcquiredNow = trophyChallengeService.isTodayChallengeAcquired()
          setIsAcquired(isAcquiredNow)
          
          // 条件を再チェック（自動獲得はしないように、条件のみ更新）
          const conditionResult = trophyChallengeService.checkAcquisitionCondition()
          setCondition(conditionResult)
        }, 100) // 100ms待ってから再読み込み
        
        // 少し待ってからリセット中フラグを解除（自動チェックを再有効化）
        // これにより、リセット直後の自動獲得を防ぐ
        setTimeout(() => {
          setIsResetting(false)
        }, 1000) // 1秒後に自動チェックを再有効化
        
        alert('チャレンジをリセットしました。')
      } else {
        setIsResetting(false) // 失敗時はフラグを解除
        alert('リセットに失敗しました。トロフィーが獲得されていない可能性があります。')
      }
    }
  }

  if (!challenge) {
    return (
      <Card title="トロフィーチャレンジ">
        <p>トロフィーが準備されていません。</p>
      </Card>
    )
  }

  const trophy = challenge.trophy

  return (
    <div className="trophy-challenge">
      <Card title="本日のトロフィーチャレンジ">
        <div className="trophy-challenge-content">
          {/* 獲得アニメーション */}
          {showAnimation && (
            <div className="trophy-acquisition-animation">
              <div className="animation-content">
                <h2>🎉 トロフィー獲得！</h2>
                {imageError ? (
                  <div className="trophy-image-placeholder-large">
                    <span className="placeholder-icon-large">🏆</span>
                  </div>
                ) : (
                  <img
                    src={trophy.image}
                    alt={trophy.name}
                    className="trophy-image-large"
                    onError={(e) => {
                      console.error(`画像読み込みエラー: ${trophy.image}`, e)
                      setImageError(true)
                    }}
                  />
                )}
                <p className="trophy-name-large">{trophy.name}</p>
              </div>
            </div>
          )}

          {/* トロフィー表示 */}
          <div className="trophy-display">
            <div className={`trophy-card ${isAcquired ? 'acquired' : ''}`}>
              {imageError ? (
                <div className="trophy-image-placeholder">
                  <span className="placeholder-icon">🏆</span>
                </div>
              ) : (
                <img
                  src={trophy.image}
                  alt={trophy.name}
                  className="trophy-image"
                  onError={(e) => {
                    console.error(`画像読み込みエラー: ${trophy.image}`, e)
                    setImageError(true)
                  }}
                />
              )}
              <h3 className="trophy-name">{trophy.name}</h3>
              <p className="trophy-description">{trophy.description}</p>
              {isAcquired && (
                <div className="acquired-badge">✓ 獲得済み</div>
              )}
            </div>
          </div>

          {/* 獲得条件 */}
          <div className="acquisition-condition">
            <h3>獲得条件</h3>
            <p className="condition-description">
              今日が期限日のタスクのうち、2日前までに作成されたタスクをすべて完了してください。
            </p>

            {condition && (
              <div className="condition-progress">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(condition.completedCount / condition.totalCount) * 100}%`,
                    }}
                  />
                </div>
                <p className="progress-text">
                  {condition.completedCount} / {condition.totalCount} タスク完了
                </p>
              </div>
            )}

            {condition && condition.eligibleTasks.length > 0 && (
              <div className="eligible-tasks">
                <h4>対象タスク一覧</h4>
                <ul>
                  {condition.eligibleTasks.map((task) => (
                    <li
                      key={task.id}
                      className={task.completed ? 'completed' : ''}
                    >
                      <span className="task-checkbox">
                        {task.completed ? '✓' : '○'}
                      </span>
                      <span className="task-title">{task.title}</span>
                      <span className="task-date">
                        (作成: {new Date(task.createdAt).toLocaleDateString('ja-JP')})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {condition && condition.eligibleTasks.length === 0 && (
              <div className="no-eligible-tasks">
                <p>
                  獲得条件を満たすタスクがありません。
                  <br />
                  2日前までに作成されたタスクで、今日が期限日のタスクを追加してください。
                </p>
              </div>
            )}
          </div>

          {/* 手動獲得ボタン（デバッグ用、通常は自動獲得） */}
          {condition && condition.isEligible && !isAcquired && (
            <div className="acquire-button-container">
              <Button variant="primary" onClick={handleAcquire}>
                トロフィーを獲得する
              </Button>
            </div>
          )}

          {/* テスト用ツール */}
          <div className="test-tools-section">
            <div className="test-tools-header">
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowTestTools(!showTestTools)}
              >
                {showTestTools ? 'テストツールを隠す' : 'テストツールを表示'}
              </Button>
            </div>

            {showTestTools && (
              <div className="test-tools-content">
                <h4>🧪 テスト用ツール</h4>
                <p className="test-tools-description">
                  開発・テスト用の機能です。本番環境では使用しないでください。
                </p>
                <div className="test-tools-buttons">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={handleCreateTestTask}
                  >
                    テストタスクを作成
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={handleCompleteEligibleTasks}
                    disabled={!condition || condition.eligibleTasks.length === 0}
                  >
                    対象タスクを完了
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={handleForceAcquire}
                    disabled={isAcquired}
                  >
                    トロフィーを強制獲得
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={handleResetChallenge}
                    disabled={!isAcquired}
                  >
                    獲得状態をリセット
                  </Button>
                </div>
                <div className="test-tools-info">
                  <p>
                    <strong>テストタスクを作成:</strong> 2日前に作成された、今日が期限日のタスクを作成します。
                  </p>
                  <p>
                    <strong>対象タスクを完了:</strong> 獲得条件の対象となるタスクをすべて完了にします。
                  </p>
                  <p>
                    <strong>トロフィーを強制獲得:</strong> 条件をスキップしてトロフィーを獲得します。
                  </p>
                  <p>
                    <strong>獲得状態をリセット:</strong> 本日のチャレンジの獲得状態をリセットします。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default TrophyChallenge
