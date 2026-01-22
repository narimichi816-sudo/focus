import { todoStorage } from './StorageManager.js'
import { createTodoTask } from '../models/TodoTask.js'
import { validateTodoTask } from '../utils/validators.js'

/**
 * Todoタスクサービス
 * TodoタスクのCRUD操作を提供する
 */
class TodoService {
  /**
   * すべてのTodoタスクを取得する
   * @returns {Array<TodoTask>}
   */
  getAll() {
    return todoStorage.getAll()
  }

  /**
   * IDでTodoタスクを取得する
   * @param {string} id - タスクID
   * @returns {TodoTask|null}
   */
  getById(id) {
    const todos = this.getAll()
    return todos.find((todo) => todo.id === id) || null
  }

  /**
   * Todoタスクを作成する
   * @param {Object} data - タスクデータ
   * @param {string} data.title - タスク名
   * @param {string|null} [data.dueDate] - 期限日
   * @returns {TodoTask}
   * @throws {Error} バリデーションエラー
   */
  create(data) {
    const validationError = validateTodoTask(data)
    if (validationError) {
      throw new Error(validationError)
    }

    const todo = createTodoTask(data)
    const todos = this.getAll()
    todos.push(todo)
    todoStorage.save(todos)
    return todo
  }

  /**
   * Todoタスクを更新する
   * @param {string} id - タスクID
   * @param {Object} data - 更新データ
   * @returns {TodoTask|null}
   * @throws {Error} バリデーションエラー
   */
  update(id, data) {
    const todos = this.getAll()
    const index = todos.findIndex((todo) => todo.id === id)

    if (index === -1) {
      return null
    }

    const updatedTodo = { ...todos[index], ...data }

    // タイトルのバリデーション
    if (data.title !== undefined) {
      const validationError = validateTodoTask({ title: data.title })
      if (validationError) {
        throw new Error(validationError)
      }
    }

    // 完了状態が変更された場合、完了日時を更新
    if (data.completed !== undefined) {
      if (data.completed && !updatedTodo.completedAt) {
        updatedTodo.completedAt = new Date().toISOString()
      } else if (!data.completed) {
        updatedTodo.completedAt = null
      }
    }

    todos[index] = updatedTodo
    todoStorage.save(todos)
    return updatedTodo
  }

  /**
   * Todoタスクを削除する
   * @param {string} id - タスクID
   * @returns {boolean} 削除成功した場合true
   */
  delete(id) {
    const todos = this.getAll()
    const filteredTodos = todos.filter((todo) => todo.id !== id)

    if (filteredTodos.length === todos.length) {
      return false
    }

    todoStorage.save(filteredTodos)
    return true
  }

  /**
   * 完了済みタスクを取得する
   * @returns {Array<TodoTask>}
   */
  getCompleted() {
    return this.getAll().filter((todo) => todo.completed)
  }

  /**
   * 未完了タスクを取得する
   * @returns {Array<TodoTask>}
   */
  getIncomplete() {
    return this.getAll().filter((todo) => !todo.completed)
  }

  /**
   * 当日のタスクを取得する
   * @returns {Array<TodoTask>}
   */
  getTodayTasks() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    return this.getAll().filter((todo) => {
      if (!todo.dueDate) return false
      const dueDateStr = todo.dueDate.split('T')[0]
      return dueDateStr === todayStr
    })
  }
}

export default new TodoService()
