/**
 * データバリデーション関数
 */

/**
 * Todoタスクのバリデーション
 * @param {Object} data - タスクデータ
 * @param {string} [data.title] - タスク名
 * @param {string|null} [data.dueDate] - 期限日
 * @returns {string|null} エラーメッセージ、バリデーション成功時はnull
 */
export function validateTodoTask(data) {
  // タイトルの必須チェック
  if (data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      return 'タスク名は必須です'
    }
    if (data.title.trim().length === 0) {
      return 'タスク名は空にできません'
    }
    if (data.title.length > 200) {
      return 'タスク名は200文字以内で入力してください'
    }
  }

  // 期限日の妥当性チェック
  if (data.dueDate !== undefined && data.dueDate !== null) {
    if (typeof data.dueDate !== 'string') {
      return '期限日は文字列形式で入力してください'
    }

    const dueDate = new Date(data.dueDate)
    if (isNaN(dueDate.getTime())) {
      return '有効な日付を入力してください'
    }

    // 過去の日付は許可しない（要件定義書には明記されていないが、一般的な制約）
    // 日付部分のみを比較する（時刻は無視、タイムゾーンの問題を回避）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD形式
    
    const dueDateObj = new Date(dueDate)
    const dueDateStr = dueDateObj.toISOString().split('T')[0] // YYYY-MM-DD形式
    
    if (dueDateStr < todayStr) {
      return '期限日は今日以降の日付を入力してください'
    }
  }

  return null
}

/**
 * ジャーナルエントリーのバリデーション
 * @param {Object} data - ジャーナルデータ
 * @param {string} [data.content] - ジャーナルの内容
 * @returns {string|null} エラーメッセージ、バリデーション成功時はnull
 */
export function validateJournalEntry(data) {
  // 内容の必須チェック
  if (data.content !== undefined) {
    if (!data.content || typeof data.content !== 'string') {
      return 'ジャーナルの内容は必須です'
    }
    if (data.content.trim().length === 0) {
      return 'ジャーナルの内容は空にできません'
    }
    // 長すぎる内容のチェック（10000文字制限）
    if (data.content.length > 10000) {
      return 'ジャーナルの内容は10000文字以内で入力してください'
    }
  }

  return null
}

/**
 * ポモドーロ設定のバリデーション
 * @param {Object} data - 設定データ
 * @param {number} [data.sessionDuration] - 作業時間（分）
 * @param {number} [data.shortBreakDuration] - 短休憩時間（分）
 * @param {number} [data.longBreakDuration] - 長休憩時間（分）
 * @param {number} [data.sessionsUntilLongBreak] - 長休憩までのセッション数
 * @param {number} [data.totalSessions] - 繰り返し回数
 * @returns {string|null} エラーメッセージ、バリデーション成功時はnull
 */
export function validatePomodoroSettings(data) {
  // 作業時間のチェック
  if (data.sessionDuration !== undefined) {
    if (
      typeof data.sessionDuration !== 'number' ||
      isNaN(data.sessionDuration)
    ) {
      return '作業時間は数値で入力してください'
    }
    if (data.sessionDuration <= 0) {
      return '作業時間は1分以上を入力してください'
    }
    if (data.sessionDuration > 120) {
      return '作業時間は120分以下を入力してください'
    }
  }

  // 短休憩時間のチェック
  if (data.shortBreakDuration !== undefined) {
    if (
      typeof data.shortBreakDuration !== 'number' ||
      isNaN(data.shortBreakDuration)
    ) {
      return '短休憩時間は数値で入力してください'
    }
    if (data.shortBreakDuration < 0) {
      return '短休憩時間は0分以上を入力してください'
    }
    if (data.shortBreakDuration > 60) {
      return '短休憩時間は60分以下を入力してください'
    }
  }

  // 長休憩時間のチェック
  if (data.longBreakDuration !== undefined) {
    if (
      typeof data.longBreakDuration !== 'number' ||
      isNaN(data.longBreakDuration)
    ) {
      return '長休憩時間は数値で入力してください'
    }
    if (data.longBreakDuration < 0) {
      return '長休憩時間は0分以上を入力してください'
    }
    if (data.longBreakDuration > 120) {
      return '長休憩時間は120分以下を入力してください'
    }
  }

  // 長休憩までのセッション数のチェック
  if (data.sessionsUntilLongBreak !== undefined) {
    if (
      typeof data.sessionsUntilLongBreak !== 'number' ||
      isNaN(data.sessionsUntilLongBreak)
    ) {
      return '長休憩までのセッション数は数値で入力してください'
    }
    if (data.sessionsUntilLongBreak < 1) {
      return '長休憩までのセッション数は1以上を入力してください'
    }
    if (data.sessionsUntilLongBreak > 20) {
      return '長休憩までのセッション数は20以下を入力してください'
    }
  }

  // 繰り返し回数のチェック
  if (data.totalSessions !== undefined) {
    if (
      typeof data.totalSessions !== 'number' ||
      isNaN(data.totalSessions)
    ) {
      return '繰り返し回数は数値で入力してください'
    }
    if (data.totalSessions < 1) {
      return '繰り返し回数は1以上を入力してください'
    }
    if (data.totalSessions > 50) {
      return '繰り返し回数は50以下を入力してください'
    }
  }

  return null
}

export default {
  validateTodoTask,
  validateJournalEntry,
  validatePomodoroSettings,
}
