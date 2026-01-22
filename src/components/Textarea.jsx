import './Textarea.css'

/**
 * テキストエリアコンポーネント
 * @param {Object} props
 * @param {string} [props.placeholder] - プレースホルダー
 * @param {string} [props.value] - 値
 * @param {Function} [props.onChange] - 変更時のコールバック
 * @param {string} [props.label] - ラベル
 * @param {string} [props.error] - エラーメッセージ
 * @param {boolean} [props.required] - 必須フラグ
 * @param {boolean} [props.disabled] - 無効化フラグ
 * @param {number} [props.rows] - 行数
 * @param {string} [props.className] - 追加のCSSクラス
 * @param {Object} [props.otherProps] - その他のprops
 */
function Textarea({
  placeholder = '',
  value = '',
  onChange,
  label = '',
  error = '',
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...otherProps
}) {
  return (
    <div className={`textarea-group ${className}`}>
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <textarea
        className={`textarea-field ${error ? 'textarea-field-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        {...otherProps}
      />
      {error && <span className="textarea-error">{error}</span>}
    </div>
  )
}

export default Textarea
