'use client'

import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

interface Props {
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
  onReady: () => void
}

export default function ChatInterface({ messages, onMessagesChange, onReady }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const startChat = async () => {
    setStarted(true)
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], phase: 'chat' }),
    })
    const data = await res.json()
    onMessagesChange([{ role: 'assistant', content: data.message }])
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const newMessages: Message[] = [...messages, { role: 'user', content: input.trim() }]
    onMessagesChange(newMessages)
    setInput('')
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, phase: 'chat' }),
    })
    const data = await res.json()
    onMessagesChange([...newMessages, { role: 'assistant', content: data.message }])
    setLoading(false)
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500 text-center text-sm leading-relaxed">
          AIと話しながら、気持ちを整理しましょう。<br />
          整理できたら、自分の言葉でメッセージを書きます。
        </p>
        <button
          onClick={startChat}
          className="bg-rose-500 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-600 transition text-sm"
        >
          話しはじめる
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-rose-500 text-white rounded-br-none'
                : 'bg-white text-gray-700 rounded-bl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm text-gray-400 text-sm">...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="気持ちを話してみてください"
            rows={2}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-rose-500 text-white px-4 rounded-xl disabled:opacity-40 hover:bg-rose-600 transition text-sm font-medium"
          >
            送信
          </button>
        </div>
        {messages.length >= 4 && (
          <button
            onClick={onReady}
            className="w-full text-rose-500 border border-rose-300 rounded-xl py-2 text-sm hover:bg-rose-50 transition"
          >
            気持ちが整理できた → メッセージを書く
          </button>
        )}
      </div>
    </div>
  )
}
