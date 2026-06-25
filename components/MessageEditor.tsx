'use client'

import { useState } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

interface Props {
  chatMessages: Message[]
  onSave: (userMessage: string, aiComment: string) => Promise<void>
  onBack: () => void
}

export default function MessageEditor({ chatMessages, onSave, onBack }: Props) {
  const [userMessage, setUserMessage] = useState('')
  const [aiComment, setAiComment] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [commentGenerated, setCommentGenerated] = useState(false)
  const [error, setError] = useState('')

  const generateComment = async () => {
    setGenerating(true)
    setError('')
    const messagesToSend = chatMessages.length > 0
      ? chatMessages
      : [{ role: 'user' as const, content: `次のメッセージへの補足コメントを書いてください：${userMessage}` }]
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messagesToSend, phase: 'comment' }),
    })
    const data = await res.json()
    if (data.error) {
      setError('コメントの生成に失敗しました。もう一度お試しください。')
      setGenerating(false)
      return
    }
    setAiComment(data.message || '')
    setCommentGenerated(true)
    setGenerating(false)
  }

  const copyToClipboard = () => {
    const text = `${userMessage}\n\n---\n📝 補足（AIより）\n${aiComment}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!userMessage.trim() || !aiComment.trim()) return
    setSaving(true)
    await onSave(userMessage, aiComment)
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">あなたのメッセージ</label>
        <textarea
          value={userMessage}
          onChange={e => setUserMessage(e.target.value)}
          placeholder="会話を参考に、自分の言葉でメッセージを書いてみましょう"
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!commentGenerated ? (
        <button
          onClick={generateComment}
          disabled={generating || !userMessage.trim()}
          className="w-full bg-amber-400 text-white py-3 rounded-xl font-medium hover:bg-amber-500 transition disabled:opacity-40"
        >
          {generating ? 'AIコメントを生成中...' : 'AIに補足コメントを作ってもらう'}
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AIからの補足コメント</label>
            <textarea
              value={aiComment}
              onChange={e => setAiComment(e.target.value)}
              rows={4}
              className="w-full border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button onClick={generateComment} disabled={generating} className="text-xs text-gray-400 mt-1 hover:text-gray-600">
              再生成する
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">プレビュー（LINEに貼る内容）</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{userMessage}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-400">📝 補足（AIより）</p>
              <p className="text-sm text-gray-600 mt-1">{aiComment}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition"
            >
              {copied ? 'コピーしました！' : 'LINEにコピー'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition disabled:opacity-40"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      )}

      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">
        ← AIとの会話に戻る
      </button>
    </div>
  )
}
