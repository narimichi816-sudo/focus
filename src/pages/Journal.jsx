import { useState, useEffect } from 'react'
import './Journal.css'
import { Card, Button, Textarea, Modal } from '../components/index.js'
import journalService from '../services/JournalService.js'

/**
 * ジャーナルページコンポーネント
 */
function Journal() {
  const [journals, setJournals] = useState([])
  const [groupedJournals, setGroupedJournals] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingJournal, setEditingJournal] = useState(null)
  const [viewingJournal, setViewingJournal] = useState(null)
  const [formData, setFormData] = useState({
    content: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  // ジャーナルを読み込む
  useEffect(() => {
    loadJournals()
  }, [])

  // 日付別にグループ化
  useEffect(() => {
    groupJournalsByDate()
  }, [journals])

  // ジャーナルを読み込む
  const loadJournals = () => {
    const allJournals = journalService.getAll()
    // 作成日時の降順でソート（新しいものが上）
    const sorted = [...allJournals].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    setJournals(sorted)
  }

  // 日付別にグループ化
  const groupJournalsByDate = () => {
    const grouped = {}
    journals.forEach((journal) => {
      const dateStr = journal.createdAt.split('T')[0]
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(journal)
    })
    setGroupedJournals(grouped)
  }

  // フォームをリセット
  const resetForm = () => {
    setFormData({ content: '' })
    setFormErrors({})
  }

  // バリデーション
  const validateForm = () => {
    const errors = {}

    if (!formData.content.trim()) {
      errors.content = 'ジャーナルの内容は必須です'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ジャーナルを追加
  const handleAdd = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  // ジャーナルを保存（追加）
  const handleSaveAdd = () => {
    if (!validateForm()) {
      return
    }

    try {
      journalService.create({
        content: formData.content.trim(),
      })
      loadJournals()
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      setFormErrors({ content: error.message })
    }
  }

  // ジャーナルを編集
  const handleEdit = (journal) => {
    setEditingJournal(journal)
    setFormData({
      content: journal.content,
    })
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  // ジャーナルを保存（更新）
  const handleSaveEdit = () => {
    if (!validateForm()) {
      return
    }

    try {
      journalService.update(editingJournal.id, {
        content: formData.content.trim(),
      })
      loadJournals()
      setIsEditModalOpen(false)
      setEditingJournal(null)
      resetForm()
    } catch (error) {
      setFormErrors({ content: error.message })
    }
  }

  // ジャーナルを表示
  const handleView = (journal) => {
    setViewingJournal(journal)
    setIsViewModalOpen(true)
  }

  // ジャーナルを削除
  const handleDelete = (id) => {
    if (window.confirm('このジャーナルを削除しますか？')) {
      journalService.delete(id)
      loadJournals()
      if (isViewModalOpen && viewingJournal?.id === id) {
        setIsViewModalOpen(false)
        setViewingJournal(null)
      }
    }
  }

  // 日付をフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  // 日付を短い形式でフォーマット
  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // 時刻をフォーマット
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 検索フィルター
  const getFilteredJournals = () => {
    if (!searchQuery.trim()) {
      return journals
    }

    const query = searchQuery.toLowerCase()
    return journals.filter((journal) =>
      journal.content.toLowerCase().includes(query)
    )
  }

  // 検索結果を日付別にグループ化
  const getGroupedFilteredJournals = () => {
    const filtered = getFilteredJournals()
    const grouped = {}
    filtered.forEach((journal) => {
      const dateStr = journal.createdAt.split('T')[0]
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(journal)
    })
    return grouped
  }

  const displayJournals = searchQuery.trim()
    ? getGroupedFilteredJournals()
    : groupedJournals

  const sortedDates = Object.keys(displayJournals).sort(
    (a, b) => new Date(b) - new Date(a)
  )

  return (
    <div className="journal">
      <Card title="ジャーナル" className="journal-card">
        <div className="journal-header">
          <div className="journal-controls">
            <Button variant="primary" onClick={handleAdd}>
              新しいジャーナルを作成
            </Button>
            <div className="journal-search">
              <input
                type="text"
                className="search-input"
                placeholder="ジャーナルを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="journal-content">
          {sortedDates.length === 0 ? (
            <div className="journal-empty">
              <p>ジャーナルがありません</p>
              <Button variant="outline" onClick={handleAdd}>
                最初のジャーナルを作成
              </Button>
            </div>
          ) : (
            <div className="journal-list">
              {sortedDates.map((dateStr) => (
                <div key={dateStr} className="journal-date-group">
                  <h3 className="journal-date-header">
                    {formatDate(dateStr)}
                  </h3>
                  <div className="journal-entries">
                    {displayJournals[dateStr].map((journal) => (
                      <div key={journal.id} className="journal-entry">
                        <div className="journal-entry-header">
                          <span className="journal-entry-time">
                            {formatTime(journal.createdAt)}
                            {journal.updatedAt !== journal.createdAt && (
                              <span className="journal-updated-badge">
                                （編集済み）
                              </span>
                            )}
                          </span>
                          <div className="journal-entry-actions">
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleView(journal)}
                            >
                              表示
                            </Button>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleEdit(journal)}
                            >
                              編集
                            </Button>
                            <Button
                              variant="danger"
                              size="small"
                              onClick={() => handleDelete(journal.id)}
                            >
                              削除
                            </Button>
                          </div>
                        </div>
                        <div className="journal-entry-preview">
                          {journal.content.length > 200
                            ? `${journal.content.substring(0, 200)}...`
                            : journal.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 追加モーダル */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        title="新しいジャーナルを作成"
      >
        <div className="journal-form">
          <div className="form-field">
            <Textarea
              label="ジャーナルの内容"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="今日の出来事や気持ちを記録してください..."
              rows={10}
              required
              error={formErrors.content}
            />
          </div>
          <div className="form-actions">
            <Button variant="primary" onClick={handleSaveAdd}>
              保存
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingJournal(null)
          resetForm()
        }}
        title="ジャーナルを編集"
      >
        <div className="journal-form">
          <div className="form-field">
            <Textarea
              label="ジャーナルの内容"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="今日の出来事や気持ちを記録してください..."
              rows={10}
              required
              error={formErrors.content}
            />
          </div>
          <div className="form-actions">
            <Button variant="primary" onClick={handleSaveEdit}>
              保存
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingJournal(null)
                resetForm()
              }}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>

      {/* 表示モーダル */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewingJournal(null)
        }}
        title={viewingJournal ? formatDate(viewingJournal.createdAt) : ''}
      >
        {viewingJournal && (
          <div className="journal-view">
            <div className="journal-view-meta">
              <p>
                <strong>作成日時:</strong>{' '}
                {formatDate(viewingJournal.createdAt)} {formatTime(viewingJournal.createdAt)}
              </p>
              {viewingJournal.updatedAt !== viewingJournal.createdAt && (
                <p>
                  <strong>更新日時:</strong>{' '}
                  {formatDate(viewingJournal.updatedAt)} {formatTime(viewingJournal.updatedAt)}
                </p>
              )}
            </div>
            <div className="journal-view-content">
              {viewingJournal.content.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
              ))}
            </div>
            <div className="journal-view-actions">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(viewingJournal)
                }}
              >
                編集
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleDelete(viewingJournal.id)
                }}
              >
                削除
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Journal
