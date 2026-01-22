import { useEffect, useRef } from 'react'
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
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // フォーカストラップ: モーダルが開いたときにフォーカスを保存
      previousActiveElement.current = document.activeElement
      // モーダルが開いたら最初のフォーカス可能な要素にフォーカス
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 100)
    } else {
      document.body.style.overflow = ''
      // モーダルが閉じたときに以前のフォーカスに戻す
      previousActiveElement.current?.focus()
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

  // フォーカストラップ: Tabキーでモーダル内のフォーカスを循環させる
  useEffect(() => {
    if (!isOpen) return

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    const modal = modalRef.current
    modal?.addEventListener('keydown', handleTabKey)
    return () => {
      modal?.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">{title}</h2>
            {showCloseButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="閉じる"
                type="button"
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
