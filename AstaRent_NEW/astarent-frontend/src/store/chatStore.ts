import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { Chat, Message } from '@/types'
import { chatsApi } from '@/api'

interface ChatStore {
  socket: Socket | null
  chats: Chat[]
  activeChat: Chat | null
  messages: Message[]
  isConnected: boolean
  isLoading: boolean
  totalUnread: number

  connect: (token: string) => void
  disconnect: () => void

  fetchChats: () => Promise<void>
  openChat: (chatId: string) => Promise<void>
  startChat: (listingId: string) => Promise<Chat>
  sendMessage: (text: string) => void
  markAsRead: (chatId: string) => void
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  chats: [],
  activeChat: null,
  messages: [],
  isConnected: false,
  isLoading: false,
  totalUnread: 0,

  connect: (token) => {
    // Prevent duplicate connections - disconnect any existing socket first
    const existing = get().socket
    if (existing) {
      existing.removeAllListeners()
      existing.disconnect()
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => set({ isConnected: true }))
    socket.on('disconnect', () => set({ isConnected: false }))

    socket.on('new_message', (message: Message) => {
      const { activeChat, messages, chats } = get()

      // Avoid adding a message that's already in the list (dedupe by id)
      if (activeChat && message.chatId === activeChat.id) {
        const alreadyExists = messages.some((m) => m.id === message.id)
        if (!alreadyExists) {
          set({ messages: [...messages, message] })
        }
        socket.emit('mark_read', { chatId: message.chatId })
      }

      const updatedChats = chats.map((c) =>
        c.id === message.chatId
          ? {
              ...c,
              lastMessage: message,
              unreadCount: activeChat?.id === message.chatId ? 0 : c.unreadCount + 1,
            }
          : c
      )
      const totalUnread = updatedChats.reduce((sum, c) => sum + c.unreadCount, 0)
      set({ chats: updatedChats, totalUnread })
    })

    socket.on('message_sent', (message: Message) => {
      const { messages } = get()
      const alreadyExists = messages.some((m) => m.id === message.id)
      if (!alreadyExists) {
        set({ messages: [...messages, message] })
      }
    })

    set({ socket })
  },

  disconnect: () => {
    const socket = get().socket
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
    }
    set({ socket: null, isConnected: false })
  },

  fetchChats: async () => {
    try {
      const { data } = await chatsApi.getAll()
      const chats: Chat[] = data.data
      const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0)
      set({ chats, totalUnread })
    } catch {}
  },

  openChat: async (chatId) => {
    set({ isLoading: true, messages: [] })
    try {
      const [chatRes, msgsRes] = await Promise.all([
        chatsApi.getById(chatId),
        chatsApi.getMessages(chatId),
      ])
      set({
        activeChat: chatRes.data.data,
        messages: msgsRes.data.data,
        isLoading: false,
      })
      get().socket?.emit('join_chat', { chatId })
      get().markAsRead(chatId)
    } catch {
      set({ isLoading: false })
    }
  },

  startChat: async (listingId) => {
    const { data } = await chatsApi.startChat(listingId)
    const chat: Chat = data.data
    const existing = get().chats.find((c) => c.id === chat.id)
    if (!existing) set({ chats: [chat, ...get().chats] })
    return chat
  },

  sendMessage: (text) => {
    const { socket, activeChat } = get()
    if (!socket || !activeChat) return
    socket.emit('send_message', { chatId: activeChat.id, text })
  },

  markAsRead: (chatId) => {
    const updatedChats = get().chats.map((c) =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    )
    const totalUnread = updatedChats.reduce((sum, c) => sum + c.unreadCount, 0)
    set({ chats: updatedChats, totalUnread })
  },
}))
