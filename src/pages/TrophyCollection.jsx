import { useState, useEffect } from 'react'
import acquiredTrophyService from '../services/AcquiredTrophyService.js'
import trophyService from '../services/TrophyService.js'
import { Card, Button } from '../components/index.js'
import './TrophyCollection.css'

/**
 * トロフィーコレクションページコンポーネント
 */
function TrophyCollection() {
  const [collectionItems, setCollectionItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [sortBy, setSortBy] = useState('acquiredAt') // acquiredAt, name, type
  const [filterType, setFilterType] = useState('all') // all, card, badge, character
  const [selectedTrophy, setSelectedTrophy] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set()) // 画像読み込みエラーを追跡

  useEffect(() => {
    loadCollection()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [collectionItems, sortBy, filterType])

  /**
   * コレクションを読み込む
   */
  const loadCollection = () => {
    const acquiredTrophies = acquiredTrophyService.getAll()
    const allTrophies = trophyService.getAll()

    // ????????????????????
    const items = acquiredTrophies
      .map((acquired) => {
        const trophy = allTrophies.find((t) => t.id === acquired.trophyId)
        if (!trophy) return null

        return {
          ...acquired,
          trophy,
        }
      })
      .filter((item) => item !== null)

    setCollectionItems(items)
  }

  /**
   * フィルターとソートを適用する
   */
  const applyFiltersAndSort = () => {
    let filtered = [...collectionItems]

    // 種類でフィルター
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.trophy.type === filterType)
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'acquiredAt':
          return new Date(b.acquiredAt) - new Date(a.acquiredAt)
        case 'name':
          return a.trophy.name.localeCompare(b.trophy.name, 'ja')
        case 'type':
          return a.trophy.type.localeCompare(b.trophy.type)
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }

  /**
   * コレクション進捗を計算する
   */
  const getCollectionProgress = () => {
    const totalTrophies = trophyService.getAll().length
    const acquiredCount = collectionItems.length
    const progressRate = totalTrophies > 0 ? (acquiredCount / totalTrophies) * 100 : 0

    return {
      acquiredCount,
      totalCount: totalTrophies,
      progressRate,
    }
  }

  const progress = getCollectionProgress()

  return (
    <div className="trophy-collection">
      <Card title="トロフィーコレクション">
        {/* コレクション進捗 */}
        <div className="collection-progress">
          <h3>コレクション進捗</h3>
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-label">獲得数</span>
              <span className="stat-value">{progress.acquiredCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">総数</span>
              <span className="stat-value">{progress.totalCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">進捗率</span>
              <span className="stat-value">{progress.progressRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress.progressRate}%` }}
            />
          </div>
        </div>

        {/* フィルターとソート */}
        <div className="collection-controls">
          <div className="filter-group">
            <label htmlFor="filter-type">種類でフィルター:</label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="card">カード</option>
              <option value="badge">バッジ</option>
              <option value="character">立ち絵</option>
            </select>
          </div>
          <div className="sort-group">
            <label htmlFor="sort-by">ソート:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="acquiredAt">獲得日時順</option>
              <option value="name">名前順</option>
              <option value="type">種類順</option>
            </select>
          </div>
        </div>

        {/* トロフィー一覧 */}
        {filteredItems.length === 0 ? (
          <div className="empty-collection">
            <p>獲得済みのトロフィーがありません。</p>
            <p>トロフィーチャレンジで条件を満たしてトロフィーを獲得しましょう！</p>
          </div>
        ) : (
          <div className="trophy-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="trophy-item"
                onClick={() => setSelectedTrophy(item)}
              >
                {imageErrors.has(item.id) ? (
                  <div className="trophy-image-placeholder">
                    <span className="placeholder-icon">🏆</span>
                    <span className="placeholder-text">画像読み込みエラー</span>
                  </div>
                ) : (
                  <img
                    src={item.trophy.image}
                    alt={item.trophy.name}
                    className="trophy-image"
                    onError={(e) => {
                      console.error(`画像読み込みエラー: ${item.trophy.image}`, {
                        trophyId: item.trophy.id,
                        trophyName: item.trophy.name,
                        imagePath: item.trophy.image,
                        error: e,
                        currentUrl: window.location.href,
                      })
                      setImageErrors((prev) => new Set([...prev, item.id]))
                    }}
                    onLoad={() => {
                      // 画像が正常に読み込まれた場合、エラーセットから削除
                      setImageErrors((prev) => {
                        const newSet = new Set(prev)
                        newSet.delete(item.id)
                        return newSet
                      })
                    }}
                  />
                )}
                <h4 className="trophy-name">{item.trophy.name}</h4>
                <p className="trophy-type">{getTypeLabel(item.trophy.type)}</p>
                <p className="acquired-date">
                  獲得日: {new Date(item.acquiredAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* トロフィー詳細モーダル */}
      {selectedTrophy && (
        <div
          className="trophy-modal-overlay"
          onClick={() => setSelectedTrophy(null)}
        >
          <div
            className="trophy-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              onClick={() => setSelectedTrophy(null)}
            >
              ×
            </button>
            <div className="trophy-modal-body">
              {imageErrors.has(selectedTrophy.id) ? (
                <div className="trophy-image-placeholder-large">
                  <span className="placeholder-icon-large">🏆</span>
                  <span className="placeholder-text-large">画像読み込みエラー</span>
                </div>
              ) : (
                <img
                  src={selectedTrophy.trophy.image}
                  alt={selectedTrophy.trophy.name}
                  className="trophy-image-large"
                  onError={(e) => {
                    console.error(`画像読み込みエラー: ${selectedTrophy.trophy.image}`, {
                      trophyId: selectedTrophy.trophy.id,
                      trophyName: selectedTrophy.trophy.name,
                      imagePath: selectedTrophy.trophy.image,
                      error: e,
                      currentUrl: window.location.href,
                    })
                    setImageErrors((prev) => new Set([...prev, selectedTrophy.id]))
                  }}
                  onLoad={() => {
                    setImageErrors((prev) => {
                      const newSet = new Set(prev)
                      newSet.delete(selectedTrophy.id)
                      return newSet
                    })
                  }}
                />
              )}
              <h2 className="trophy-name-large">{selectedTrophy.trophy.name}</h2>
              <p className="trophy-type-large">{getTypeLabel(selectedTrophy.trophy.type)}</p>
              <p className="trophy-description">{selectedTrophy.trophy.description}</p>
              <div className="trophy-acquired-info">
                <p>
                  <strong>獲得日時:</strong>{' '}
                  {new Date(selectedTrophy.acquiredAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * トロフィーの種類ラベルを取得する
 * @param {string} type - トロフィーの種類
 * @returns {string}
 */
function getTypeLabel(type) {
  const labels = {
    card: 'カード',
    badge: 'バッジ',
    character: '立ち絵',
  }
  return labels[type] || type
}

export default TrophyCollection
