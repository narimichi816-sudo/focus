import { acquiredTrophyStorage } from './StorageManager.js'
import { createAcquiredTrophy } from '../models/AcquiredTrophy.js'

/**
 * 獲得済みトロフィーサービス
 * 獲得済みトロフィーの管理を提供する
 */
class AcquiredTrophyService {
  /**
   * すべての獲得済みトロフィーを取得する
   * @returns {Array<AcquiredTrophy>}
   */
  getAll() {
    return acquiredTrophyStorage.getAll()
  }

  /**
   * IDで獲得済みトロフィーを取得する
   * @param {string} id - 獲得済みトロフィーID
   * @returns {AcquiredTrophy|null}
   */
  getById(id) {
    const acquiredTrophies = this.getAll()
    return (
      acquiredTrophies.find((acquired) => acquired.id === id) || null
    )
  }

  /**
   * トロフィーIDで獲得済みトロフィーを取得する
   * @param {string} trophyId - トロフィーID
   * @returns {AcquiredTrophy|null}
   */
  getByTrophyId(trophyId) {
    const acquiredTrophies = this.getAll()
    return (
      acquiredTrophies.find(
        (acquired) => acquired.trophyId === trophyId
      ) || null
    )
  }

  /**
   * 獲得済みトロフィーを作成する
   * @param {Object} data - 獲得済みトロフィーデータ
   * @param {string} data.trophyId - トロフィーID
   * @returns {AcquiredTrophy}
   */
  create(data) {
    // 既に獲得済みかチェック
    const existing = this.getByTrophyId(data.trophyId)
    if (existing) {
      return existing
    }

    const acquiredTrophy = createAcquiredTrophy(data)
    const acquiredTrophies = this.getAll()
    acquiredTrophies.push(acquiredTrophy)
    acquiredTrophyStorage.save(acquiredTrophies)
    return acquiredTrophy
  }

  /**
   * 獲得済みトロフィーを削除する
   * @param {string} id - 獲得済みトロフィーID
   * @returns {boolean} 削除成功した場合true
   */
  delete(id) {
    const acquiredTrophies = this.getAll()
    const filteredAcquiredTrophies = acquiredTrophies.filter(
      (acquired) => acquired.id !== id
    )

    if (filteredAcquiredTrophies.length === acquiredTrophies.length) {
      return false
    }

    acquiredTrophyStorage.save(filteredAcquiredTrophies)
    return true
  }

  /**
   * トロフィーIDで獲得済みトロフィーを削除する
   * @param {string} trophyId - トロフィーID
   * @returns {boolean} 削除成功した場合true
   */
  deleteByTrophyId(trophyId) {
    const acquiredTrophies = this.getAll()
    const filteredAcquiredTrophies = acquiredTrophies.filter(
      (acquired) => acquired.trophyId !== trophyId
    )

    if (filteredAcquiredTrophies.length === acquiredTrophies.length) {
      return false
    }

    acquiredTrophyStorage.save(filteredAcquiredTrophies)
    return true
  }

  /**
   * 指定したトロフィーが獲得済みかどうかをチェックする
   * @param {string} trophyId - トロフィーID
   * @returns {boolean}
   */
  isAcquired(trophyId) {
    return this.getByTrophyId(trophyId) !== null
  }
}

export default new AcquiredTrophyService()
