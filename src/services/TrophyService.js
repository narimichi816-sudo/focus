import { trophyStorage } from './StorageManager.js'
import { createTrophy } from '../models/Trophy.js'

/**
 * トロフィーサービス
 * トロフィーの管理を提供する
 */
class TrophyService {
  /**
   * すべてのトロフィーを取得する
   * @returns {Array<Trophy>}
   */
  getAll() {
    return trophyStorage.getAll()
  }

  /**
   * IDでトロフィーを取得する
   * @param {string} id - トロフィーID
   * @returns {Trophy|null}
   */
  getById(id) {
    const trophies = this.getAll()
    return trophies.find((trophy) => trophy.id === id) || null
  }

  /**
   * トロフィーを作成する
   * @param {Object} data - トロフィーデータ
   * @returns {Trophy}
   */
  create(data) {
    const trophy = createTrophy(data)
    const trophies = this.getAll()
    trophies.push(trophy)
    trophyStorage.save(trophies)
    return trophy
  }

  /**
   * 複数のトロフィーを一括作成する
   * @param {Array<Object>} trophiesData - トロフィーデータの配列
   * @returns {Array<Trophy>}
   */
  createMany(trophiesData) {
    const trophies = trophiesData.map((data) => createTrophy(data))
    const allTrophies = this.getAll()
    allTrophies.push(...trophies)
    trophyStorage.save(allTrophies)
    return trophies
  }

  /**
   * トロフィーを更新する
   * @param {string} id - トロフィーID
   * @param {Object} data - 更新データ
   * @returns {Trophy|null}
   */
  update(id, data) {
    const trophies = this.getAll()
    const index = trophies.findIndex((trophy) => trophy.id === id)

    if (index === -1) {
      return null
    }

    const updatedTrophy = { ...trophies[index], ...data }
    trophies[index] = updatedTrophy
    trophyStorage.save(trophies)
    return updatedTrophy
  }

  /**
   * トロフィーを削除する
   * @param {string} id - トロフィーID
   * @returns {boolean} 削除成功した場合true
   */
  delete(id) {
    const trophies = this.getAll()
    const filteredTrophies = trophies.filter((trophy) => trophy.id !== id)

    if (filteredTrophies.length === trophies.length) {
      return false
    }

    trophyStorage.save(filteredTrophies)
    return true
  }
}

export default new TrophyService()
