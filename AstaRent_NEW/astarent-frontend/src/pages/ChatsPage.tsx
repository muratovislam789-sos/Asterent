import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Send, MessageCircle, ArrowLeft } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ChatsPage() {
  const { id: chatId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { chats, activeChat, messages, isLoading, fetchChats, openChat, sendMessage } = useChatStore()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchChats() }, [])
  useEffect(() => { if (chatId) openChat(chatId) }, [chatId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(text.trim())
    setText('')
  }

  const formatTime = (date: string) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru }) } catch { return '' }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex gap-5">
      {/* Chat list - hidden on mobile when chat is open */}
      <div className={`w-full md:w-72 flex-shrink-0 ${chatId ? 'hidden md:flex' : 'flex'} flex-col gap-0`}>
        <div className="card overflow-hidden flex-1 flex flex-col">
          <div className="px-4 py-3.5 border-b border-border">
            <h2 className="font-bold text-gray-900 text-base">Чаты</h2>
          </div>
          {chats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-text">Нет активных чатов</p>
              <Link to="/listings" className="btn-primary mt-4 text-xs">Найти жильё</Link>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {chats.map(chat => {
                const other = user?.role === 'tenant' ? chat.landlord : chat.tenant
                const isActive = chatId === chat.id
                return (
                  <button key={chat.id} onClick={() => navigate('/chats/' + chat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-border/50 ${isActive ? 'bg-primary-50' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                        {other?.name?.[0] ?? '?'}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{other?.name}</p>
                      <p className="text-xs text-text truncate mt-0.5">{chat.listing?.title || 'Объявление'}</p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{chat.lastMessage.text}</p>
                      )}
                    </div>
                    {chat.updatedAt && <p className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(chat.updatedAt)}</p>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`flex-1 ${!chatId ? 'hidden md:flex' : 'flex'} flex-col`}>
        {!activeChat ? (
          <div className="flex-1 card flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">Выберите чат</h3>
            <p className="text-sm text-text">Выберите диалог из списка слева</p>
          </div>
        ) : (
          <div className="card flex flex-col flex-1 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
              <button onClick={() => navigate('/chats')} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              {(() => {
                const other = user?.role === 'tenant' ? activeChat.landlord : activeChat.tenant
                return (
                  <>
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                      {other?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{other?.name}</p>
                      <p className="text-xs text-text">{activeChat.listing?.title}</p>
                    </div>
                  </>
                )
              })()}
              {activeChat.listing && (
                <Link to={'/listings/' + activeChat.listing.id} className="ml-auto text-xs text-primary-600 hover:underline hidden md:block">
                  Просмотреть объявление →
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-text">Начните диалог. Напишите первое сообщение!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === user?.id
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-border">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:bg-white transition-all"
              />
              <button type="submit" disabled={!text.trim()} className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-primary-700 transition-colors disabled:opacity-40">
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
