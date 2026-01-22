import { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'
import './styles/common.css'
import { initializeAllData } from './utils/dataInitializer.js'
import {
  Layout,
  Header,
  Navigation,
  Button,
  Card,
  Notification,
} from './components/index.js'
import { PomodoroTimer, TodoList, Journal, TrophyChallenge, TrophyCollection } from './pages/index.js'
import pomodoroSettingsService from './services/PomodoroSettingsService.js'
import todoService from './services/TodoService.js'
import trophyChallengeService from './services/TrophyChallengeService.js'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info',
  })
  
  // メイン画面用の状態
  const [pomodoroSettings, setPomodoroSettings] = useState(null)
  const [todayTodos, setTodayTodos] = useState([])
  const [challenge, setChallenge] = useState(null)
  const [challengeCondition, setChallengeCondition] = useState(null)

  // URLから初期パスを取得
  useEffect(() => {
    const hash = window.location.hash.slice(1) || '/'
    setCurrentPath(hash)
    initializeAllData()
    setIsInitialized(true)
  }, [])

  // ブラウザの戻る/進むボタンに対応
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/'
      setCurrentPath(hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // パス変更時にURLを更新
  const navigate = (path) => {
    setCurrentPath(path)
    window.location.hash = path === '/' ? '' : path
  }

  // メイン画面のデータを読み込む（useCallbackでメモ化）
  const loadMainScreenData = useCallback(() => {
    // ポモドーロ設定を読み込む
    const settings = pomodoroSettingsService.get()
    setPomodoroSettings(settings)

    // 本日のTodoタスクを読み込む
    const todos = todoService.getTodayTasks()
    // 未完了のタスクを優先して表示
    const incompleteTodos = todos.filter(t => !t.completed)
    const completedTodos = todos.filter(t => t.completed)
    const sortedTodos = [...incompleteTodos, ...completedTodos]
    setTodayTodos(sortedTodos.slice(0, 5)) // 最大5件まで表示

    // 本日のトロフィーチャレンジを読み込む
    const todayChallenge = trophyChallengeService.getTodayChallenge()
    setChallenge(todayChallenge)
    
    if (todayChallenge) {
      const condition = trophyChallengeService.checkAcquisitionCondition()
      setChallengeCondition(condition)
    }
  }, [])

  // メイン画面用のデータを読み込む
  useEffect(() => {
    if (isInitialized && currentPath === '/') {
      loadMainScreenData()
    }
  }, [isInitialized, currentPath, loadMainScreenData])

  // メイン画面のデータを定期的に更新（Todoやトロフィーの状態が変わる可能性があるため）
  useEffect(() => {
    if (!isInitialized || currentPath !== '/') {
      return
    }

    // 初回読み込み
    loadMainScreenData()

    // 5秒ごとにデータを更新（Todoの完了状態やトロフィーの進捗を反映）
    const interval = setInterval(() => {
      loadMainScreenData()
    }, 5000)

    return () => clearInterval(interval)
  }, [isInitialized, currentPath, loadMainScreenData])

  // navItemsをuseMemoでメモ化
  const navItems = useMemo(() => [
    { id: '1', label: 'ホーム', path: '/' },
    { id: '2', label: 'ポモドーロ', path: '/pomodoro' },
    { id: '3', label: 'Todo', path: '/todo' },
    { id: '4', label: 'ジャーナル', path: '/journal' },
    { id: '5', label: 'トロフィー', path: '/trophy' },
    { id: '6', label: 'コレクション', path: '/collection' },
  ], [])

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ isVisible: true, message, type })
  }, [])

  if (!isInitialized) {
    return (
      <Layout title="集中力向上・習慣化アプリ">
        <div className="text-center">
          <p>初期化中...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="集中力向上・習慣化アプリ"
      headerChildren={
        <Navigation
          items={navItems}
          currentPath={currentPath}
          onNavigate={navigate}
        />
      }
    >

      {currentPath === '/pomodoro' ? (
        <PomodoroTimer />
      ) : currentPath === '/todo' ? (
        <TodoList />
      ) : currentPath === '/journal' ? (
        <Journal />
      ) : currentPath === '/trophy' ? (
        <TrophyChallenge />
      ) : currentPath === '/collection' ? (
        <TrophyCollection />
      ) : (
        <div className="main-screen">
          <div className="main-screen-grid">
            {/* ポモドーロタイマーの簡易表示 */}
            <Card 
              title="ポモドーロタイマー" 
              className="main-pomodoro-card"
            >
              {pomodoroSettings ? (
                <div className="main-pomodoro-content">
                  <div className="main-pomodoro-info">
                    <p className="main-pomodoro-settings">
                      作業時間: {pomodoroSettings.sessionDuration}分
                      <br />
                      短休憩: {pomodoroSettings.shortBreakDuration}分
                      <br />
                      長休憩: {pomodoroSettings.longBreakDuration}分
                      <br />
                      繰り返し: {pomodoroSettings.totalSessions}回
                    </p>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/pomodoro')}
                    className="main-navigate-button"
                  >
                    タイマーを開く
                  </Button>
                </div>
              ) : (
                <p>読み込み中...</p>
              )}
            </Card>

            {/* 本日のTodoリストの簡易表示 */}
            <Card 
              title="本日のTodo" 
              className="main-todo-card"
            >
              <div className="main-todo-content">
                {todayTodos.length === 0 ? (
                  <div className="main-todo-empty">
                    <p>本日のタスクはありません</p>
                    <Button 
                      variant="outline" 
                      size="small"
                      onClick={() => navigate('/todo')}
                    >
                      Todoリストを開く
                    </Button>
                  </div>
                ) : (
                  <>
                    <ul className="main-todo-list">
                      {todayTodos.map((todo) => (
                        <li 
                          key={todo.id} 
                          className={`main-todo-item ${todo.completed ? 'completed' : ''}`}
                        >
                          <span className="main-todo-checkbox">
                            {todo.completed ? '✓' : '○'}
                          </span>
                          <span className="main-todo-title">{todo.title}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="main-todo-footer">
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => navigate('/todo')}
                      >
                        すべて表示
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* 本日のトロフィーチャレンジの簡易表示 */}
            <Card 
              title="本日のトロフィーチャレンジ" 
              className="main-trophy-card"
            >
              {challenge ? (
                <div className="main-trophy-content">
                  <div className="main-trophy-display">
                    <img 
                      src={challenge.trophy.image} 
                      alt={challenge.trophy.name}
                      className="main-trophy-image"
                    />
                    <h3 className="main-trophy-name">{challenge.trophy.name}</h3>
                    <p className="main-trophy-description">{challenge.trophy.description}</p>
                  </div>
                  
                  {challengeCondition && (
                    <div className="main-trophy-progress">
                      <div className="main-progress-bar-container">
                        <div
                          className="main-progress-bar"
                          style={{
                            width: `${challengeCondition.totalCount > 0 
                              ? (challengeCondition.completedCount / challengeCondition.totalCount) * 100 
                              : 0}%`,
                          }}
                        />
                      </div>
                      <p className="main-progress-text">
                        {challengeCondition.completedCount} / {challengeCondition.totalCount} 完了
                      </p>
                      {challengeCondition.totalCount === 0 && (
                        <p className="main-progress-hint">
                          2日前までに作成されたタスクを設定してください
                        </p>
                      )}
                    </div>
                  )}

                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/trophy')}
                    className="main-navigate-button"
                  >
                    チャレンジ詳細を見る
                  </Button>
                </div>
              ) : (
                <div className="main-trophy-empty">
                  <p>トロフィーが読み込めませんでした</p>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => navigate('/trophy')}
                  >
                    トロフィーページを開く
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </Layout>
  )
}

export default App
