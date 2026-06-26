import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI honne - 伝えたい気持ちを言葉にする',
  description: '本音を伝えにくい相手へのメッセージを、AIと一緒に作るアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-rose-50">{children}</body>
    </html>
  )
}
