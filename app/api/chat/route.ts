import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages, phase } = await req.json()

    const systemPrompt = phase === 'comment'
      ? `あなたは感情整理の専門家です。ユーザーとの会話を読んで、ユーザーが伝えたい相手へのメッセージに添える補足コメントを生成してください。

補足コメントの要件：
- ユーザーの気持ちや状況を第三者視点で簡潔に説明する
- 受け取る相手が文脈を理解しやすくなる内容
- 100〜200文字程度
- 温かく共感的なトーン
- 「この方は...」「送り主の方は...」など第三者視点で書く

補足コメントのみを返してください。説明や前置きは不要です。`
      : `あなたは感情整理のサポーターです。ユーザーが本音を伝えにくい相手へのメッセージを作る手助けをします。

あなたの役割：
- ユーザーの気持ちや状況を優しく引き出す
- 判断せず、共感しながら話を聞く
- 具体的な状況、感情、相手への思いを丁寧に掘り下げる

会話のフロー：
1. まず「誰に何を伝えたいですか？」と聞く
2. 状況や感情を深掘りする（2〜3回）
3. 準備ができたら「気持ちが整理できてきましたね。メッセージを書いてみませんか？」と促す

返答は短く、温かく。一度に一つの質問だけしてください。`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ message: content.text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
