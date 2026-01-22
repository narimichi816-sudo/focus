import { useEffect } from 'react'
import './Notification.css'

/**
 * 通知コンポーネント
 * @param {Object} props
 * @param {string} props.message - 通知メッセージ
 * @param {string} [props.type] - 通知タイプ（success, error, info, warning）
 * @param {boolean} [props.isVisible] - 表示状態
 * @param {Function} [props.onClose] - 閉じる時のコールバック
 * @param {number} [props.duration] - 自動で閉じるまでの時間（ミリ秒、0で無効）
 */
function Notification({
  message,
  type = 'info',
  isVisible = false,
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (isVisible && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        {onClose && (
          <button
            className="notification-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default Notification
