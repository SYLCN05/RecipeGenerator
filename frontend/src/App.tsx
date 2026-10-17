import { useReducer, useState } from 'react'
import { sendConversationTurn } from './api'
import { conversationReducer, initialConversationState } from './conversationReducer'
import type { Language } from './types'

function App() {
  const [state, dispatch] = useReducer(conversationReducer, initialConversationState)
  const [draft, setDraft] = useState('')

  async function sendTurn(userMessage: string) {
    if (!state.language || !userMessage.trim()) return

    dispatch({ type: 'SEND_START' })
    try {
      const response = await sendConversationTurn({
        language: state.language,
        peopleCount: state.peopleCount,
        history: state.history,
        lastOfferedRecipes: state.lastOfferedRecipes,
        userMessage,
      })
      dispatch({ type: 'SEND_SUCCESS', userMessage, response })
    } catch (err) {
      dispatch({ type: 'SEND_ERROR', message: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft
    setDraft('')
    void sendTurn(text)
  }

  function selectLanguage(language: Language) {
    dispatch({ type: 'SET_LANGUAGE', language })
  }

  if (!state.language) {
    return (
      <main>
        <h1>What's for dinner?</h1>
        <p>Choose a conversation language:</p>
        <button onClick={() => selectLanguage('nl')}>Nederlands</button>
        <button onClick={() => selectLanguage('tr')}>Türkçe</button>
      </main>
    )
  }

  return (
    <main>
      <h1>What's for dinner?</h1>

      <section>
        {state.history.map((message, i) => (
          <p key={i}>
            <strong>{message.role === 'user' ? 'You' : 'AI'}:</strong> {message.text}
          </p>
        ))}
      </section>

      {state.stage === 'recommending' && state.recipes && (
        <section>
          <h2>Recipe ideas</h2>
          <ul>
            {state.recipes.map((recipe) => (
              <li key={recipe.id}>
                <strong>{recipe.title}</strong> — {recipe.shortDescription}
                <br />
                {recipe.macros.calories} kcal · {recipe.macros.proteinGrams}g protein ·{' '}
                {recipe.macros.carbsGrams}g carbs · {recipe.macros.fatGrams}g fat
                <br />
                <button onClick={() => sendTurn(recipe.title)}>Tell me more</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.stage === 'detail' && state.recipeDetail && (
        <section>
          <h2>
            {state.recipeDetail.title} (serves {state.recipeDetail.servings})
          </h2>
          <h3>Ingredients</h3>
          <ul>
            {state.recipeDetail.ingredients.map((ingredient, i) => (
              <li key={i}>
                {ingredient.quantity} {ingredient.name}
              </li>
            ))}
          </ul>
          <h3>Steps</h3>
          <ol>
            {state.recipeDetail.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <p>
            {state.recipeDetail.macros.calories} kcal · {state.recipeDetail.macros.proteinGrams}g
            protein · {state.recipeDetail.macros.carbsGrams}g carbs ·{' '}
            {state.recipeDetail.macros.fatGrams}g fat (estimated, per serving)
          </p>
        </section>
      )}

      {state.status === 'error' && <p role="alert">Error: {state.errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={state.status === 'sending'}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={state.status === 'sending'}>
          Send
        </button>
      </form>
    </main>
  )
}

export default App
