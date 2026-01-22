import { useState, useEffect } from 'react'
import './TodoList.css'
import { Card, Button, Input, Modal } from '../components/index.js'
import todoService from '../services/TodoService.js'

/**
 * Todoリストページコンポーネント
 */
function TodoList() {
  const [todos, setTodos] = useState([])
  const [filteredTodos, setFilteredTodos] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [sortBy, setSortBy] = useState('dueDate') // dueDate, createdAt
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
  })
  const [formErrors, setFormErrors] = useState({})

  // タスクを読み込む
  useEffect(() => {
    loadTodos()
  }, [])

  // フィルターとソートを適用
  useEffect(() => {
    applyFiltersAndSort()
  }, [todos, showCompleted, sortBy])

  // タスクを読み込む
  const loadTodos = () => {
    const allTodos = todoService.getAll()
    setTodos(allTodos)
  }

  // フィルターとソートを適用
  const applyFiltersAndSort = () => {
    let filtered = [...todos]

    // 完了済みタスクのフィルター
    if (!showCompleted) {
      filtered = filtered.filter((todo) => !todo.completed)
    }

    // 当日のタスクを優先表示（未完了の当日タスクを先頭に）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const todayTodos = filtered.filter((todo) => {
      if (!todo.dueDate) return false
      const dueDateStr = todo.dueDate.split('T')[0]
      return dueDateStr === todayStr && !todo.completed
    })

    const otherTodos = filtered.filter((todo) => {
      if (!todo.dueDate) return true
      const dueDateStr = todo.dueDate.split('T')[0]
      return dueDateStr !== todayStr || todo.completed
    })

    // ソート
    const sortTodos = (todoList) => {
      return [...todoList].sort((a, b) => {
        if (sortBy === 'dueDate') {
          // 期限日順（期限日がないものは最後に）
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        } else {
          // 作成日時順
          return new Date(a.createdAt) - new Date(b.createdAt)
        }
      })
    }

    const sortedTodayTodos = sortTodos(todayTodos)
    const sortedOtherTodos = sortTodos(otherTodos)

    setFilteredTodos([...sortedTodayTodos, ...sortedOtherTodos])
  }

  // フォームをリセット
  const resetForm = () => {
    setFormData({ title: '', dueDate: '' })
    setFormErrors({})
  }

  // バリデーション
  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'タスク名は必須です'
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dueDate < today) {
        errors.dueDate = '期限日は今日以降の日付を選択してください'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // タスクを追加
  const handleAdd = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  // タスクを保存（追加）
  const handleSaveAdd = () => {
    if (!validateForm()) {
      return
    }

    try {
      todoService.create({
        title: formData.title.trim(),
        dueDate: formData.dueDate || null,
      })
      loadTodos()
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      setFormErrors({ title: error.message })
    }
  }

  // タスクを編集
  const handleEdit = (todo) => {
    setEditingTodo(todo)
    setFormData({
      title: todo.title,
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
    })
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  // タスクを保存（更新）
  const handleSaveEdit = () => {
    if (!validateForm()) {
      return
    }

    try {
      todoService.update(editingTodo.id, {
        title: formData.title.trim(),
        dueDate: formData.dueDate || null,
      })
      loadTodos()
      setIsEditModalOpen(false)
      setEditingTodo(null)
      resetForm()
    } catch (error) {
      setFormErrors({ title: error.message })
    }
  }

  // タスクを削除
  const handleDelete = (id) => {
    if (window.confirm('このタスクを削除しますか？')) {
      todoService.delete(id)
      loadTodos()
    }
  }

  // 完了状態を切り替え
  const handleToggleComplete = (id) => {
    const todo = todoService.getById(id)
    if (todo) {
      todoService.update(id, { completed: !todo.completed })
      loadTodos()
    }
  }

  // 日付をフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 日付を短い形式でフォーマット
  const formatDateShort = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
  }

  // 期限日が近いかどうかを判定
  const isDueSoon = (dueDate) => {
    if (!dueDate) return false
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  }

  // 期限日が過ぎているかどうかを判定
  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }

  return (
    <div className="todo-list">
      <Card title="Todoリスト" className="todo-list-card">
        <div className="todo-list-header">
          <div className="todo-controls">
            <Button variant="primary" onClick={handleAdd}>
              タスクを追加
            </Button>
            <div className="todo-filters">
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                />
                <span>完了済みを表示</span>
              </label>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dueDate">期限日順</option>
                <option value="createdAt">作成日順</option>
              </select>
            </div>
          </div>
        </div>

        <div className="todo-list-content">
          {filteredTodos.length === 0 ? (
            <div className="todo-empty">
              <p>タスクがありません</p>
              <Button variant="outline" onClick={handleAdd}>
                最初のタスクを追加
              </Button>
            </div>
          ) : (
            <ul className="todo-items">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? 'completed' : ''} ${
                    isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''
                  } ${isDueSoon(todo.dueDate) && !todo.completed ? 'due-soon' : ''}`}
                >
                  <div className="todo-item-content">
                    <input
                      type="checkbox"
                      className="todo-checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo.id)}
                    />
                    <div className="todo-item-info">
                      <div className="todo-item-title">{todo.title}</div>
                      <div className="todo-item-meta">
                        {todo.dueDate && (
                          <span
                            className={`todo-due-date ${
                              isOverdue(todo.dueDate, todo.completed)
                                ? 'overdue'
                                : isDueSoon(todo.dueDate) && !todo.completed
                                  ? 'due-soon'
                                  : ''
                            }`}
                          >
                            期限: {formatDateShort(todo.dueDate)}
                          </span>
                        )}
                        {todo.completedAt && (
                          <span className="todo-completed-date">
                            完了: {formatDateShort(todo.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="todo-item-actions">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEdit(todo)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(todo.id)}
                    >
                      削除
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
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
        title="タスクを追加"
      >
        <div className="todo-form">
          <div className="form-field">
            <Input
              label="タスク名"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="タスク名を入力してください"
              required
              error={formErrors.title}
            />
          </div>
          <div className="form-field">
            <Input
              type="date"
              label="期限日（オプション）"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              error={formErrors.dueDate}
            />
          </div>
          <div className="form-actions">
            <Button variant="primary" onClick={handleSaveAdd}>
              追加
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
          setEditingTodo(null)
          resetForm()
        }}
        title="タスクを編集"
      >
        <div className="todo-form">
          <div className="form-field">
            <Input
              label="タスク名"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="タスク名を入力してください"
              required
              error={formErrors.title}
            />
          </div>
          <div className="form-field">
            <Input
              type="date"
              label="期限日（オプション）"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              error={formErrors.dueDate}
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
                setEditingTodo(null)
                resetForm()
              }}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TodoList
