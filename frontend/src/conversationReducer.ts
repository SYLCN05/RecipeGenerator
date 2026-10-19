import type {
  ChatMessage,
  ConversationTurnResponse,
  Language,
  RecipeDetail,
  RecipeSummary,
  Stage,
} from './types'

export interface ConversationState {
  language: Language | null
  peopleCount: number | null
  history: ChatMessage[]
  lastOfferedRecipes: RecipeSummary[] | null
  stage: Stage | null
  recipes: RecipeSummary[] | null
  recipeDetail: RecipeDetail | null
  status: 'idle' | 'sending' | 'error'
  errorMessage: string | null
  lastFailedMessage: string | null
}

export const initialConversationState: ConversationState = {
  language: null,
  peopleCount: null,
  history: [],
  lastOfferedRecipes: null,
  stage: null,
  recipes: null,
  recipeDetail: null,
  status: 'idle',
  errorMessage: null,
  lastFailedMessage: null,
}

export type ConversationAction =
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SEND_START' }
  | { type: 'SEND_SUCCESS'; userMessage: string; response: ConversationTurnResponse }
  | { type: 'SEND_ERROR'; message: string; userMessage: string }

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...initialConversationState, language: action.language }

    case 'SEND_START':
      return { ...state, status: 'sending', errorMessage: null }

    case 'SEND_SUCCESS': {
      const { response, userMessage } = action
      const newHistory: ChatMessage[] = [
        ...state.history,
        { role: 'user', text: userMessage },
        { role: 'assistant', text: response.assistantMessageText },
      ]

      return {
        ...state,
        status: 'idle',
        history: newHistory,
        peopleCount: response.peopleCount,
        stage: response.stage,
        recipes: response.recipes,
        recipeDetail: response.recipeDetail,
        lastOfferedRecipes: response.recipes ?? state.lastOfferedRecipes,
        lastFailedMessage: null,
      }
    }

    case 'SEND_ERROR':
      return {
        ...state,
        status: 'error',
        errorMessage: action.message,
        lastFailedMessage: action.userMessage,
      }

    default:
      return state
  }
}
