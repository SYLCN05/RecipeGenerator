import type { ConversationTurnRequest, ConversationTurnResponse } from './types'

const API_BASE_URL = 'http://localhost:5266'

export async function sendConversationTurn(
  request: ConversationTurnRequest,
): Promise<ConversationTurnResponse> {
  const response = await fetch(`${API_BASE_URL}/api/conversation/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Conversation turn failed with status ${response.status}`)
  }

  return (await response.json()) as ConversationTurnResponse
}
