import './Button.css'

/**
 * ボタンコンポーネント
 * @param {Object} props
 * @param {React.ReactNode} props.children - ボタンの内容
 * @param {string} [props.variant] - ボタンのバリアント（primary, secondary, danger）
 * @param {string} [props.size] - ボタンのサイズ（small, medium, large）
 * @param {boolean} [props.disabled] - 無効化フラグ
 * @param {Function} [props.onClick] - クリック時のコールバック
 * @param {string} [props.type] - ボタンのタイプ（button, submit, reset）
 * @param {string} [props.className] - 追加のCSSクラス
 */
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
