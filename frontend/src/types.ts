export type Language = 'nl' | 'tr'

export type Stage = 'asking' | 'recommending' | 'detail'

export interface Macros {
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

export interface RecipeSummary {
  id: string
  title: string
  shortDescription: string
  macros: Macros
}

export interface Ingredient {
  name: string
  quantity: string
}

export interface RecipeDetail {
  id: string
  title: string
  servings: number
  ingredients: Ingredient[]
  steps: string[]
  macros: Macros
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export interface ConversationTurnRequest {
  language: Language
  peopleCount: number | null
  history: ChatMessage[]
  lastOfferedRecipes: RecipeSummary[] | null
  userMessage: string
}

export interface ConversationTurnResponse {
  stage: Stage
  assistantMessageText: string
  peopleCount: number | null
  recipes: RecipeSummary[] | null
  recipeDetail: RecipeDetail | null
}
