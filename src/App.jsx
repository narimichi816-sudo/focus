import { useState, useEffect } from 'react'
import './App.css'
import TodoService from './services/TodoService.js'
import JournalService from './services/JournalService.js'
import PomodoroSettingsService from './services/PomodoroSettingsService.js'
import { initializeAllData } from './utils/dataInitializer.js'

function App() {
  const [testResults, setTestResults] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // データ初期化
    initializeAllData()
    setIsInitialized(true)

    // 動作確認テスト
    const results = []

    try {
      // 1. ポモドーロ設定のテスト
      const settings = PomodoroSettingsService.get()
      results.push({
        test: 'ポモドーロ設定の取得',
        status: settings ? '成功' : '失敗',
        data: settings,
      })

      // 2. Todoタスクの作成・取得テスト
      const todo = TodoService.create({
        title: 'テストタスク',
        dueDate: new Date().toISOString(),
      })
      results.push({
        test: 'Todoタスクの作成',
        status: todo ? '成功' : '失敗',
        data: todo,
      })

      const todos = TodoService.getAll()
      results.push({
        test: 'Todoタスクの取得',
        status: todos.length > 0 ? '成功' : '失敗',
        data: `取得数: ${todos.length}`,
      })

      // 3. ジャーナルエントリーの作成・取得テスト
      const journal = JournalService.create({
        content: 'テストジャーナル',
      })
      results.push({
        test: 'ジャーナルエントリーの作成',
        status: journal ? '成功' : '失敗',
        data: journal,
      })

      const journals = JournalService.getAll()
      results.push({
        test: 'ジャーナルエントリーの取得',
        status: journals.length > 0 ? '成功' : '失敗',
        data: `取得数: ${journals.length}`,
      })

      // 4. バリデーションテスト
      try {
        TodoService.create({ title: '' })
        results.push({
          test: 'Todoタスクのバリデーション（空のタイトル）',
          status: '失敗（エラーが発生すべき）',
        })
      } catch (error) {
        results.push({
          test: 'Todoタスクのバリデーション（空のタイトル）',
          status: '成功（エラーが正しく発生）',
          data: error.message,
        })
      }
    } catch (error) {
      results.push({
        test: 'テスト実行中にエラー',
        status: '失敗',
        data: error.message,
      })
    }

    setTestResults(results)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>集中力向上・習慣化アプリ</h1>
        <p>ステップ2: データモデル設計とストレージ実装 - 動作確認</p>
      </header>
      <main className="app-main">
        <div className="card">
          <h2>動作確認テスト結果</h2>
          {!isInitialized ? (
            <p>初期化中...</p>
          ) : (
            <div className="test-results">
              {testResults.map((result, index) => (
                <div key={index} className="test-result">
                  <div className="test-name">
                    <strong>{result.test}</strong>
                    <span
                      className={`test-status ${
                        result.status === '成功' ? 'success' : 'failure'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  {result.data && (
                    <div className="test-data">
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
