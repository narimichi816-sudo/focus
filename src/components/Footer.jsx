import './Footer.css'

/**
 * フッターコンポーネント
 */
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          &copy; {currentYear} 集中力向上・習慣化アプリ
        </p>
      </div>
    </footer>
  )
}

export default Footer
