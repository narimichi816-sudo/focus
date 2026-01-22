import './Header.css'

/**
 * ヘッダーコンポーネント
 * @param {Object} props
 * @param {string} [props.title] - ヘッダーのタイトル
 * @param {React.ReactNode} [props.children] - 追加のコンテンツ
 */
function Header({ title = '集中力向上・習慣化アプリ', children }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        {children && <div className="header-actions">{children}</div>}
      </div>
    </header>
  )
}

export default Header
