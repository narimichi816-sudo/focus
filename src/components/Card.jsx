import { memo } from 'react'
import './Card.css'

/**
 * カードコンポーネント
 * @param {Object} props
 * @param {React.ReactNode} props.children - カードの内容
 * @param {string} [props.title] - カードのタイトル
 * @param {string} [props.className] - 追加のCSSクラス
 */
function Card({ children, title, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  )
}

export default memo(Card)
