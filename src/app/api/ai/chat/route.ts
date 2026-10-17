import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { chat } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const user = await getSession(req)
    const { message, conversationId } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Load or create conversation
    let conversation: any = null
    if (user) {
      if (conversationId) {
        conversation = await db.aIConversation.findUnique({ where: { id: conversationId, userId: user.id }, include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } } })
      }
      if (!conversation) {
        conversation = await db.aIConversation.create({ data: { userId: user.id, title: message.slice(0, 60), messages: { create: [] } }, include: { messages: true } })
      }
    }

    const history = (conversation?.messages || []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    // Run the orchestrator
    const result = await chat(user?.id || null, message, history)

    // Persist messages if logged in
    if (user && conversation) {
      const attachments = JSON.stringify({ toolResults: result.toolResults, suggestions: result.suggestions })
      await db.aIMessage.create({ data: { conversationId: conversation.id, role: 'user', content: message } })
      await db.aIMessage.create({ data: { conversationId: conversation.id, role: 'assistant', content: result.message, attachments } })
    }

    return NextResponse.json({
      message: result.message,
      toolResults: result.toolResults,
      suggestions: result.suggestions,
      conversationId: conversation?.id || null,
    })
  } catch (e: any) {
    console.error('AI chat error:', e?.message || e)
    return NextResponse.json({
      error: 'My AI assistant is having trouble right now. You can still browse and shop normally.',
      message: "I'm having trouble connecting right now, but you can keep shopping — I'll be back soon.",
      toolResults: [],
      suggestions: [],
    }, { status: 200 })
  }
}

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ conversations: [] })
  const conversations = await db.aIConversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  return NextResponse.json({ conversations })
}
