import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages, phase, userMessage } = await req.json()

    const systemPrompt = phase === 'comment'
      ? `あなたは感情整理の専門家です。ユーザーが書いたメッセージに添える補足コメントを生成してください。

補足コメントの要件：
- メッセージを受け取る相手が背景・文脈を理解できるよう第三者視点で説明する
- 送った人の気持ちや状況を温かく伝える
- 100〜200文字程度
- 「この方は...」「送り主の方は...」など第三者視点で書く
- 質問は絶対にしない。コメント文のみ返す

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

    let apiMessages: { role: 'user' | 'assistant'; content: string }[]

    if (phase === 'comment') {
      apiMessages = [{ role: 'user', content: userMessage || 'メッセージを書きました' }]
    } else {
      apiMessages = messages.length === 0
        ? [{ role: 'user', content: 'はじめてください' }]
        : messages
      if (apiMessages[0]?.role === 'assistant') {
        apiMessages = [{ role: 'user', content: 'はじめてください' }, ...apiMessages]
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: apiMessages,
    })

    const textBlock = response.content.find(c => c.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')

    return NextResponse.json({ message: textBlock.text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
