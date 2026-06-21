import { Response } from 'express'
import { viewHistoryService } from '../services/viewHistoryService'
import { sendSuccess, sendError } from '../utils/response'

export const viewHistoryController = {
  async getHistory(req: any, res: Response) {
    try {
      const history = await viewHistoryService.getHistory(req.userId)
      return sendSuccess(res, history)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },

  async clearHistory(req: any, res: Response) {
    try {
      await viewHistoryService.clearHistory(req.userId)
      return sendSuccess(res, null, 200, 'История очищена')
    } catch (err) {
      console.error(err)
      return sendError(res, 'Внутренняя ошибка сервера', 500)
    }
  },
}
