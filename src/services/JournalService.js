import { journalStorage } from './StorageManager.js'
import {
  createJournalEntry,
  updateJournalEntry,
} from '../models/JournalEntry.js'
import { validateJournalEntry } from '../utils/validators.js'

/**
 * ジャーナルサービス
 * ジャーナルエントリーのCRUD操作を提供する
 */
class JournalService {
  /**
   * すべてのジャーナルエントリーを取得する
   * @returns {Array<JournalEntry>}
   */
  getAll() {
    return journalStorage.getAll()
  }

  /**
   * IDでジャーナルエントリーを取得する
   * @param {string} id - エントリーID
   * @returns {JournalEntry|null}
   */
  getById(id) {
    const journals = this.getAll()
    return journals.find((journal) => journal.id === id) || null
  }

  /**
   * ジャーナルエントリーを作成する
   * @param {Object} data - ジャーナルデータ
   * @param {string} data.content - ジャーナルの内容
   * @returns {JournalEntry}
   * @throws {Error} バリデーションエラー
   */
  create(data) {
    const validationError = validateJournalEntry(data)
    if (validationError) {
      throw new Error(validationError)
    }

    const journal = createJournalEntry(data)
    const journals = this.getAll()
    journals.push(journal)
    journalStorage.save(journals)
    return journal
  }

  /**
   * ジャーナルエントリーを更新する
   * @param {string} id - エントリーID
   * @param {Object} data - 更新データ
   * @param {string} data.content - ジャーナルの内容
   * @returns {JournalEntry|null}
   * @throws {Error} バリデーションエラー
   */
  update(id, data) {
    const journals = this.getAll()
    const index = journals.findIndex((journal) => journal.id === id)

    if (index === -1) {
      return null
    }

    const validationError = validateJournalEntry(data)
    if (validationError) {
      throw new Error(validationError)
    }

    const updatedJournal = updateJournalEntry(journals[index], data)
    journals[index] = updatedJournal
    journalStorage.save(journals)
    return updatedJournal
  }

  /**
   * ジャーナルエントリーを削除する
   * @param {string} id - エントリーID
   * @returns {boolean} 削除成功した場合true
   */
  delete(id) {
    const journals = this.getAll()
    const filteredJournals = journals.filter((journal) => journal.id !== id)

    if (filteredJournals.length === journals.length) {
      return false
    }

    journalStorage.save(filteredJournals)
    return true
  }

  /**
   * 日付でジャーナルエントリーを取得する
   * @param {Date|string} date - 日付
   * @returns {Array<JournalEntry>}
   */
  getByDate(date) {
    const targetDate = typeof date === 'string' ? new Date(date) : date
    const dateStr = targetDate.toISOString().split('T')[0]

    return this.getAll().filter((journal) => {
      const journalDateStr = journal.createdAt.split('T')[0]
      return journalDateStr === dateStr
    })
  }
}

export default new JournalService()
