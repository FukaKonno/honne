'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ChatInterface from '@/components/ChatInterface'
import MessageEditor from '@/components/MessageEditor'

interface Message { role: 'user' | 'assistant'; content: string }

export default function NewPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [phase, setPhase] = useState<'chat' | 'write'>('chat')
  const [chatMessages, setChatMessages] = useState<Message[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/')
      else setUserId(session.user.id)
    })
  }, [router])

  const handleSave = async (userMessage: string, aiComment: string) => {
    if (!userId) return
    await supabase.from('message_sessions').insert({
      user_id: userId,
      chat_log: chatMessages,
      user_message: userMessage,
      ai_comment: aiComment,
    })
    router.push('/home')
  }

  if (!userId) return null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-rose-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/home')} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
        <h1 className="font-semibold text-gray-800">新しいメッセージを作る</h1>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs px-3 py-1 rounded-full transition ${phase === 'chat' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}>1. 話す</span>
          <span className={`text-xs px-3 py-1 rounded-full transition ${phase === 'write' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'}`}>2. 書く</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 py-4 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
        {phase === 'chat' ? (
          <ChatInterface
            messages={chatMessages}
            onMessagesChange={setChatMessages}
            onReady={() => setPhase('write')}
          />
        ) : (
          <div className="overflow-y-auto flex-1">
            <MessageEditor chatMessages={chatMessages} onSave={handleSave} onBack={() => setPhase('chat')} />
          </div>
        )}
      </div>
    </div>
  )
}
