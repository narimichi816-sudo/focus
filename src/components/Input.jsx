import './Input.css'

/**
 * 入力フィールドコンポーネント
 * @param {Object} props
 * @param {string} [props.type] - 入力タイプ（text, email, password, date等）
 * @param {string} [props.placeholder] - プレースホルダー
 * @param {string} [props.value] - 値
 * @param {Function} [props.onChange] - 変更時のコールバック
 * @param {string} [props.label] - ラベル
 * @param {string} [props.error] - エラーメッセージ
 * @param {boolean} [props.required] - 必須フラグ
 * @param {boolean} [props.disabled] - 無効化フラグ
 * @param {string} [props.className] - 追加のCSSクラス
 * @param {Object} [props.otherProps] - その他のprops
 */
function Input({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  label = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
  ...otherProps
}) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`input-field ${error ? 'input-field-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        {...otherProps}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}

export default Input
