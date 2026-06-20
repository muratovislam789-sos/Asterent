import { viewHistoryRepository } from '../repositories/viewHistoryRepository'

export const viewHistoryService = {
  async recordView(userId: string, listingId: string) {
    // Тихо записываем просмотр — не критично если что-то пойдёт не так,
    // не должно ломать показ самого объявления
    try {
      await viewHistoryRepository.recordView(userId, listingId)
    } catch (err) {
      console.error('Failed to record view history:', err)
    }
  },

  async getHistory(userId: string) {
    return viewHistoryRepository.findByUser(userId)
  },

  async clearHistory(userId: string) {
    await viewHistoryRepository.clear(userId)
  },
}
