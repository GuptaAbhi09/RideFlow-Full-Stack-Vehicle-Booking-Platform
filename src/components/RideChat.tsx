"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
import { getSocket } from '@/lib/socket'
import toast from 'react-hot-toast'

interface Message {
  sender: 'customer' | 'partner'
  text: string
  timestamp: string | Date
}

interface RideChatProps {
  bookingId: string
  role: 'customer' | 'partner'
}

const RideChat = ({ bookingId, role }: RideChatProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socket = getSocket()

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setUnreadCount(0) // Clear unread when opened
    }
  }, [messages, isOpen])

  // Fetch initial chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/bookings/${bookingId}/chat`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error("Failed to fetch chat history", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchChatHistory()
    }
  }, [bookingId])

  // Listen for socket messages
  useEffect(() => {
    if (!socket || !bookingId) return

    const handleReceiveMessage = (data: Message) => {
      setMessages(prev => [...prev, data])
      
      // If chat is closed and the message is from the OTHER person, increase unread count
      if (!isOpen && data.sender !== role) {
        setUnreadCount(prev => prev + 1)
        toast.success(`New message from ${data.sender === 'customer' ? 'Customer' : 'Driver'}`)
      }
    }

    socket.on('receive_message', handleReceiveMessage)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
    }
  }, [socket, bookingId, isOpen, role])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const messageData = {
      rideId: bookingId,
      sender: role,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    }

    // Optimistically update UI
    setMessages(prev => [...prev, messageData as Message])
    setInputText('')

    // Emit via Socket for real-time delivery
    if (socket) {
      socket.emit('send_message', messageData)
    }

    // Save to Database permanently
    try {
      await fetch(`/api/bookings/${bookingId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageData.text })
      })
    } catch (error) {
      console.error("Failed to save message to DB", error)
    }
  }

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {/* Floating Chat Button */}
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="h-14 px-6 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-white relative transition-colors"
          >
            <MessageSquare size={20} />
            <span className="font-bold">Chat</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-pulse border-2 border-[#121212]">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#1a1a1a] border border-white/10 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <h3 className="font-bold">
                  {role === 'customer' ? 'Chat with Driver' : 'Chat with Customer'}
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                  <MessageSquare size={32} className="opacity-20" />
                  <p className="text-sm text-center">No messages yet.<br/>Send a message to say hi!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === role;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-br-sm' 
                            : 'bg-white/10 text-gray-200 rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#1a1a1a] border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex justify-center items-center transition-colors shrink-0"
              >
                <Send size={18} className="mr-0.5 mt-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RideChat
