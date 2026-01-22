import { useEffect } from 'react'
import './Modal.css'
import Button from './Button.jsx'

/**
 * モーダルコンポーネント
 * @param {Object} props
 * @param {boolean} props.isOpen - モーダルの表示状態
 * @param {Function} props.onClose - 閉じる時のコールバック
 * @param {React.ReactNode} props.children - モーダルの内容
 * @param {string} [props.title] - モーダルのタイトル
 * @param {boolean} [props.showCloseButton] - 閉じるボタンを表示するか
 */
function Modal({ isOpen, onClose, children, title, showCloseButton = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            {showCloseButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="閉じる"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
