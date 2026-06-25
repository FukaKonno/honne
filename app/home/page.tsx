'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SavedMessage {
  id: string
  user_message: string
  ai_comment: string
  created_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<SavedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      const { data } = await supabase
        .from('message_sessions')
        .select('id, user_message, ai_comment, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      setMessages(data ?? [])
      setLoading(false)
    })
  }, [router])

  const copyMessage = (msg: SavedMessage) => {
    navigator.clipboard.writeText(`${msg.user_message}\n\n---\n📝 補足（AIより）\n${msg.ai_comment}`)
    setCopied(msg.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteMessage = async (id: string) => {
    await supabase.from('message_sessions').delete().eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-rose-400">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-rose-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-rose-500 font-bold text-lg">AI本音</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => router.push('/new')}
            className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-rose-600 transition"
          >
            + 新しく作る
          </button>
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">
            ログアウト
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-5xl">💬</p>
            <p className="text-gray-600 font-medium">まだメッセージがありません</p>
            <p className="text-gray-400 text-sm">AIと話しながら、伝えたい言葉を見つけましょう</p>
            <button
              onClick={() => router.push('/new')}
              className="mt-4 bg-rose-500 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-600 transition"
            >
              最初のメッセージを作る
            </button>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-700 line-clamp-2 flex-1">{msg.user_message}</p>
                  <span className="text-gray-300 text-xs mt-0.5 shrink-0">{expandedId === msg.id ? '▲' : '▼'}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>

              {expandedId === msg.id && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">あなたのメッセージ</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.user_message}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">📝 AIからの補足</p>
                    <p className="text-sm text-gray-600">{msg.ai_comment}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyMessage(msg)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition"
                    >
                      {copied === msg.id ? 'コピーしました！' : 'LINEにコピー'}
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="px-4 bg-gray-100 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-200 transition"
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
