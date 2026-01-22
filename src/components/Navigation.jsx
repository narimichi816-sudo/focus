import { useState } from 'react'
import './Navigation.css'

/**
 * ナビゲーションコンポーネント
 * @param {Object} props
 * @param {Array<{id: string, label: string, path: string}>} props.items - ナビゲーション項目
 * @param {string} [props.currentPath] - 現在のパス
 * @param {Function} [props.onNavigate] - ナビゲーション時のコールバック
 */
function Navigation({ items = [], currentPath = '', onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = (path) => {
    if (onNavigate) {
      onNavigate(path)
    }
    setIsMobileMenuOpen(false)
  }

  const handleKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNavClick(path)
    }
  }

  return (
    <nav className="navigation">
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="navigation-menu"
      >
        <span className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      <ul
        id="navigation-menu"
        className={`nav-list ${isMobileMenuOpen ? 'nav-list-open' : ''}`}
        role="menubar"
      >
        {items.map((item) => (
          <li key={item.id} className="nav-item">
            <button
              className={`nav-link ${
                currentPath === item.path ? 'nav-link-active' : ''
              }`}
              onClick={() => handleNavClick(item.path)}
              onKeyDown={(e) => handleKeyDown(e, item.path)}
              aria-label={`${item.label}に移動`}
              aria-current={currentPath === item.path ? 'page' : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
