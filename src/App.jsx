import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>集中力向上・習慣化アプリ</h1>
        <p>開発環境が正常に動作しています</p>
      </header>
      <main className="app-main">
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            カウント: {count}
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
