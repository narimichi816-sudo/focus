import { useState, useEffect } from 'react'
import trophyChallengeService from '../services/TrophyChallengeService.js'
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

  useEffect(() => {
    loadChallenge()
    checkCondition()
  }, [])

  // Todoタスクの変更を監視して条件を再チェック
  useEffect(() => {
    if (isAcquired) {
      return // 既に獲得済みの場合はチェックしない
    }

    const interval = setInterval(() => {
      checkCondition()
    }, 2000) // 2秒ごとにチェック

    return () => clearInterval(interval)
  }, [isAcquired])

  /**
   * チャレンジを読み込む
   */
  const loadChallenge = () => {
    const todayChallenge = trophyChallengeService.getTodayChallenge()
    setChallenge(todayChallenge)
    setIsAcquired(trophyChallengeService.isTodayChallengeAcquired())
  }

  /**
   * 獲得条件をチェックする
   */
  const checkCondition = () => {
    if (isAcquired) {
      return // 既に獲得済みの場合はチェックしない
    }

    const conditionResult = trophyChallengeService.checkAcquisitionCondition()
    setCondition(conditionResult)

    // 条件を満たした場合、自動的に獲得処理を実行
    if (conditionResult.isEligible && !isAcquired) {
      handleAcquire()
    }
  }

  /**
   * トロフィーを獲得する
   */
  const handleAcquire = () => {
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
                <img
                  src={trophy.image}
                  alt={trophy.name}
                  className="trophy-image-large"
                />
                <p className="trophy-name-large">{trophy.name}</p>
              </div>
            </div>
          )}

          {/* トロフィー表示 */}
          <div className="trophy-display">
            <div className={`trophy-card ${isAcquired ? 'acquired' : ''}`}>
              <img
                src={trophy.image}
                alt={trophy.name}
                className="trophy-image"
              />
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
        </div>
      </Card>
    </div>
  )
}

export default TrophyChallenge
