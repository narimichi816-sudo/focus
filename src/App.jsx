import { useState, useEffect } from 'react'
import './App.css'
import './styles/common.css'
import { initializeAllData } from './utils/dataInitializer.js'
import {
  Layout,
  Header,
  Navigation,
  Button,
  Input,
  Textarea,
  Card,
  Modal,
  Notification,
} from './components/index.js'
import { PomodoroTimer, TodoList, Journal, TrophyChallenge } from './pages/index.js'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info',
  })
  const [inputValue, setInputValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')

  useEffect(() => {
    initializeAllData()
    setIsInitialized(true)
  }, [])

  const navItems = [
    { id: '1', label: 'ホーム', path: '/' },
    { id: '2', label: 'ポモドーロ', path: '/pomodoro' },
    { id: '3', label: 'Todo', path: '/todo' },
    { id: '4', label: 'ジャーナル', path: '/journal' },
    { id: '5', label: 'トロフィー', path: '/trophy' },
  ]

  const showNotification = (message, type = 'info') => {
    setNotification({ isVisible: true, message, type })
  }

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
          onNavigate={setCurrentPath}
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card title="ステップ4: ポモドーロタイマー機能 - 実装完了">
            <p>ポモドーロタイマー機能が実装されました。</p>
            <p>ナビゲーションから「ポモドーロ」を選択してタイマーを利用できます。</p>
          </Card>

          <div className="grid grid-2">
            <Card title="ボタンコンポーネント">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Button variant="primary" onClick={() => showNotification('プライマリーボタンがクリックされました', 'info')}>
                  プライマリーボタン
                </Button>
                <Button variant="secondary" onClick={() => showNotification('セカンダリーボタンがクリックされました', 'info')}>
                  セカンダリーボタン
                </Button>
                <Button variant="danger" onClick={() => showNotification('危険ボタンがクリックされました', 'error')}>
                  危険ボタン
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                  モーダルを開く
                </Button>
                <Button disabled>無効化ボタン</Button>
              </div>
            </Card>

            <Card title="入力コンポーネント">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="テキスト入力"
                  placeholder="テキストを入力してください"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  type="date"
                  label="日付入力"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  required
                />
                {dateValue && (
                  <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                    選択された日付: {dateValue}
                  </p>
                )}
                <Textarea
                  label="テキストエリア"
                  placeholder="複数行のテキストを入力してください"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  rows={4}
                />
              </div>
            </Card>
          </div>

          <Card title="通知コンポーネント">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="small"
                onClick={() => showNotification('成功メッセージ', 'success')}
              >
                成功通知
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => showNotification('エラーメッセージ', 'error')}
              >
                エラー通知
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => showNotification('情報メッセージ', 'info')}
              >
                情報通知
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => showNotification('警告メッセージ', 'warning')}
              >
                警告通知
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="モーダルコンポーネント"
      >
        <p>これはモーダルコンポーネントのデモです。</p>
        <p>ESCキーを押すか、背景をクリックすると閉じます。</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            閉じる
          </Button>
        </div>
      </Modal>

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
