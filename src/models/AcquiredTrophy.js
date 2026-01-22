/**
 * 獲得済みトロフィーモデル
 * @typedef {Object} AcquiredTrophy
 * @property {string} id - 一意のID
 * @property {string} trophyId - トロフィーのID
 * @property {string} acquiredAt - 獲得日時（ISO 8601形式）
 */

/**
 * 獲得済みトロフィーを作成する
 * @param {Object} data - 獲得済みトロフィーデータ
 * @param {string} data.trophyId - トロフィーのID
 * @returns {AcquiredTrophy}
 */
export function createAcquiredTrophy(data) {
  return {
    id: generateId(),
    trophyId: data.trophyId,
    acquiredAt: new Date().toISOString(),
  }
}

/**
 * 一意のIDを生成する
 * @returns {string}
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default {
  createAcquiredTrophy,
}
