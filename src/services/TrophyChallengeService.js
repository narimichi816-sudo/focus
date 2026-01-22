import trophyService from './TrophyService.js'
import acquiredTrophyService from './AcquiredTrophyService.js'
import todoService from './TodoService.js'
import { challengeStorage } from './StorageManager.js'

/**
 * トロフィーチャレンジサービス
 * 本日のトロフィーチャレンジの管理と獲得条件のチェックを行う
 */
class TrophyChallengeService {
  /**
   * 今日の日付をYYYY-MM-DD形式で取得
   * @returns {string}
   */
  getTodayString() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().split('T')[0]
  }

  /**
   * 2つの日付文字列を比較する（YYYY-MM-DD形式）
   * @param {string} dateStr1
   * @param {string} dateStr2
   * @returns {number} dateStr1 < dateStr2 の場合は負の値、等しい場合は0、大きい場合は正の値
   */
  compareDateStrings(dateStr1, dateStr2) {
    return new Date(dateStr1) - new Date(dateStr2)
  }

  /**
   * 指定された日付が2日前以上かどうかを判定
   * @param {string} dateStr - 日付文字列（YYYY-MM-DD形式またはISO 8601形式）
   * @returns {boolean}
   */
  isAtLeastTwoDaysAgo(dateStr) {
    const today = new Date(this.getTodayString())
    const targetDate = new Date(dateStr.split('T')[0])
    const diffTime = today - targetDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 2
  }

  /**
   * 本日のチャレンジを取得
   * @returns {Object|null} { trophy: Trophy, date: string } または null
   */
  getTodayChallenge() {
    const today = this.getTodayString()
    const challenge = challengeStorage.get()

    // ?????????????????
    if (challenge && challenge.date === today) {
      return challenge
    }

    // ?????????????????????
    return this.generateTodayChallenge()
  }

  /**
   * 本日のチャレンジを生成
   * @returns {Object|null} { trophy: Trophy, date: string } または null
   */
  generateTodayChallenge() {
    const today = this.getTodayString()
    const allTrophies = trophyService.getAll()

    if (allTrophies.length === 0) {
      return null
    }

    // ?????????????
    const randomIndex = Math.floor(Math.random() * allTrophies.length)
    const selectedTrophy = allTrophies[randomIndex]

    const challenge = {
      trophy: selectedTrophy,
      date: today,
    }

    challengeStorage.save(challenge)
    return challenge
  }

  /**
   * 獲得条件の対象となるTodoタスクを取得
   * 条件: 今日が期限日で、かつ2日前までに作成されたタスク
   * @returns {Array<TodoTask>}
   */
  getEligibleTasks() {
    const today = this.getTodayString()
    const allTasks = todoService.getAll()

    return allTasks.filter((task) => {
      // ???????????????
      if (!task.dueDate) {
        return false
      }
      const dueDateStr = task.dueDate.split('T')[0]
      if (dueDateStr !== today) {
        return false
      }

      // ???????2?????????????
      if (!this.isAtLeastTwoDaysAgo(task.createdAt)) {
        return false
      }

      return true
    })
  }

  /**
   * 獲得条件をチェックする
   * @returns {Object} { isEligible: boolean, eligibleTasks: Array<TodoTask>, completedCount: number, totalCount: number }
   */
  checkAcquisitionCondition() {
    const eligibleTasks = this.getEligibleTasks()

    if (eligibleTasks.length === 0) {
      return {
        isEligible: false,
        eligibleTasks: [],
        completedCount: 0,
        totalCount: 0,
      }
    }

    const completedTasks = eligibleTasks.filter((task) => task.completed)
    const isEligible = completedTasks.length === eligibleTasks.length

    return {
      isEligible,
      eligibleTasks,
      completedCount: completedTasks.length,
      totalCount: eligibleTasks.length,
    }
  }

  /**
   * トロフィーを獲得する
   * @returns {Object|null} { acquiredTrophy: AcquiredTrophy, challenge: Object } または null
   */
  acquireTrophy() {
    const challenge = this.getTodayChallenge()

    if (!challenge) {
      return null
    }

    // ???????????
    if (acquiredTrophyService.isAcquired(challenge.trophy.id)) {
      return {
        acquiredTrophy: acquiredTrophyService.getByTrophyId(challenge.trophy.id),
        challenge,
      }
    }

    // ?????????
    const condition = this.checkAcquisitionCondition()
    if (!condition.isEligible) {
      return null
    }

    // ????????
    const acquiredTrophy = acquiredTrophyService.create({
      trophyId: challenge.trophy.id,
    })

    return {
      acquiredTrophy,
      challenge,
    }
  }

  /**
   * ????????????????????
   * ??????????????
   * @returns {void}
   */
  handleDateChange() {
    const today = this.getTodayString()
    const challenge = challengeStorage.get()

    // 日付が変わった場合は新しいチャレンジを生成
    if (challenge && challenge.date !== today) {
      // この処理は自動的に行われるため、通常は getTodayChallenge() を呼び出すだけで良い
      // 日付が変わった場合、getTodayChallenge() が自動的に新しいチャレンジを生成する
    }
  }

  /**
   * 本日のチャレンジが獲得済みかどうかを確認
   * @returns {boolean}
   */
  isTodayChallengeAcquired() {
    const challenge = this.getTodayChallenge()
    if (!challenge) {
      return false
    }

    return acquiredTrophyService.isAcquired(challenge.trophy.id)
  }

  /**
   * テスト用: トロフィーを強制的に獲得する（条件をスキップ）
   * @returns {Object|null} { acquiredTrophy: AcquiredTrophy, challenge: Object } または null
   */
  forceAcquireTrophy() {
    const challenge = this.getTodayChallenge()

    if (!challenge) {
      return null
    }

    // 既に獲得済みの場合はそのまま返す
    if (acquiredTrophyService.isAcquired(challenge.trophy.id)) {
      return {
        acquiredTrophy: acquiredTrophyService.getByTrophyId(challenge.trophy.id),
        challenge,
      }
    }

    // 強制的に獲得
    const acquiredTrophy = acquiredTrophyService.create({
      trophyId: challenge.trophy.id,
    })

    return {
      acquiredTrophy,
      challenge,
    }
  }

  /**
   * テスト用: チャレンジの獲得状態をリセットする
   * @returns {boolean} 成功した場合true
   */
  resetChallengeAcquisition() {
    const challenge = this.getTodayChallenge()
    if (!challenge) {
      return false
    }

    return acquiredTrophyService.deleteByTrophyId(challenge.trophy.id)
  }
}

export default new TrophyChallengeService()
