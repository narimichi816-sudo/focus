import './Layout.css'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

/**
 * レイアウトコンポーネント
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子コンポーネント
 * @param {string} [props.title] - ヘッダーのタイトル
 * @param {React.ReactNode} [props.headerChildren] - ヘッダー内に表示するコンテンツ
 */
function Layout({ children, title, headerChildren }) {
  return (
    <div className="app-layout">
      <Header title={title}>{headerChildren}</Header>
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
