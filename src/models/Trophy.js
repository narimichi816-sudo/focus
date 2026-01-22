/**
 * トロフィーモデル
 * @typedef {Object} Trophy
 * @property {string} id - 一意のID
 * @property {string} name - トロフィー名
 * @property {string} type - トロフィーの種類（card, badge, character等）
 * @property {string} image - トロフィーの画像URLまたはパス
 * @property {string} description - トロフィーの説明
 */

/**
 * トロフィーを作成する
 * @param {Object} data - トロフィーデータ
 * @param {string} data.id - トロフィーID
 * @param {string} data.name - トロフィー名
 * @param {string} data.type - トロフィーの種類
 * @param {string} data.image - トロフィーの画像URLまたはパス
 * @param {string} data.description - トロフィーの説明
 * @returns {Trophy}
 */
export function createTrophy(data) {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    image: data.image,
    description: data.description,
  }
}

export default {
  createTrophy,
}
