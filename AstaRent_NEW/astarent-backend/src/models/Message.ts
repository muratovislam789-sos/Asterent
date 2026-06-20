export interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  isRead: boolean
  createdAt: string
}

export interface SendMessageDTO {
  chatId: string
  text: string
}
