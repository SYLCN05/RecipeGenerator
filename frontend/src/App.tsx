import { useReducer, useState } from "react";
import { sendConversationTurn } from "./api";
import {
  conversationReducer,
  initialConversationState,
} from "./conversationReducer";
import { RecipeCard } from "./RecipeCard";
import { RecipeDetailView } from "./RecipeDetailView";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { VoiceOrb, type VoiceOrbState } from "./VoiceOrb";
import type { Language, RecipeSummary } from "./types";

const VOICE_ORB_STATUS: Record<VoiceOrbState, string> = {
  idle: "Tik om te praten",
  listening: "Aan het luisteren — tik om te stoppen",
  thinking: "Kookbot denkt na...",
  speaking: "Kookbot spreekt...",
};

function App() {
  const [state, dispatch] = useReducer(
    conversationReducer,
    initialConversationState,
  );
  const [draft, setDraft] = useState("");
  const [showList, setShowList] = useState(false);
  const speechSynthesis = useSpeechSynthesis();

  async function sendTurn(userMessage: string) {
    if (!state.language || !userMessage.trim()) return;

    dispatch({ type: "SEND_START" });
    try {
      const response = await sendConversationTurn({
        language: state.language,
        peopleCount: state.peopleCount,
        history: state.history,
        lastOfferedRecipes: state.lastOfferedRecipes,
        userMessage,
      });
      dispatch({ type: "SEND_SUCCESS", userMessage, response });
      speechSynthesis.speak(response.assistantMessageText, state.language);
    } catch (err) {
      console.error("Conversation turn failed:", err);
      dispatch({
        type: "SEND_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
        userMessage,
      });
    }
  }

  function selectRecipe(recipe: RecipeSummary) {
    setShowList(false);
    void sendTurn(recipe.title);
  }

  const speechRecognition = useSpeechRecognition(state.language, setDraft);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (speechRecognition.isListening) speechRecognition.stop();
    const text = draft;
    setDraft("");
    void sendTurn(text);
  }

  function selectLanguage(language: Language) {
    dispatch({ type: "SET_LANGUAGE", language });
  }

  if (!state.language) {
    return (
      <main className="language-picker">
        <h1>Wat eten we vanavond?</h1>
        <p>In welke taal wil je praten?</p>
        <div className="language-picker-options">
          <button onClick={() => selectLanguage("nl")}>Nederlands</button>
          <button onClick={() => selectLanguage("tr")}>Türkçe</button>
        </div>
      </main>
    );
  }

  const voiceOrbState: VoiceOrbState = speechRecognition.isListening
    ? "listening"
    : state.status === "sending"
      ? "thinking"
      : speechSynthesis.isSpeaking
        ? "speaking"
        : "idle";
  const voiceOrbDisabled =
    state.status === "sending" || speechSynthesis.isSpeaking;

  return (
    <>
      <header className="app-bar">
        <h1>KookBot</h1>
        {speechSynthesis.isSupported && (
          <button
            type="button"
            className="app-bar-mute"
            onClick={speechSynthesis.toggleMute}
          >
            {speechSynthesis.isMuted ? "Geluid aan" : "Dempen"}
          </button>
        )}
      </header>
      <main>
        {speechRecognition.isSupported ? (
          <div className="voice-orb-wrap">
            <VoiceOrb
              state={voiceOrbState}
              disabled={voiceOrbDisabled}
              onClick={
                speechRecognition.isListening
                  ? speechRecognition.stop
                  : speechRecognition.start
              }
              label={VOICE_ORB_STATUS[voiceOrbState]}
            />
            <p className="voice-orb-status">
              {VOICE_ORB_STATUS[voiceOrbState]}
            </p>
          </div>
        ) : (
          <p className="voice-note">
            Spraakherkenning wordt niet ondersteund in deze browser — typ je
            bericht hieronder.
          </p>
        )}

        <div className="chat-log">
          {state.history.map((message, i) => (
            <div
              key={i}
              className={`chat-message chat-message--${message.role === "user" ? "user" : "assistant"}`}
            >
              <span className="chat-message-author">
                {message.role === "user" ? "Jij" : "Kookbot"}
              </span>
              <span className="chat-message-text">{message.text}</span>
            </div>
          ))}
        </div>

        {state.stage === "recommending" && state.recipes && (
          <section>
            <h2>Suggesties voor vanavond</h2>
            <ul className="recipe-card-grid">
              {state.recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={selectRecipe}
                />
              ))}
            </ul>
          </section>
        )}

        {state.stage === "detail" &&
          state.recipeDetail &&
          (showList && state.lastOfferedRecipes ? (
            <section>
              <h2>Suggesties voor vanavond</h2>
              <ul className="recipe-card-grid">
                {state.lastOfferedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={selectRecipe}
                  />
                ))}
              </ul>
            </section>
          ) : (
            <RecipeDetailView
              recipeDetail={state.recipeDetail}
              onBackToList={
                state.lastOfferedRecipes && state.lastOfferedRecipes.length > 1
                  ? () => setShowList(true)
                  : null
              }
            />
          ))}

        {state.status === "error" && (
          <p role="alert">
            Er ging iets mis — probeer het opnieuw.
            {state.lastFailedMessage && (
              <button
                type="button"
                onClick={() => sendTurn(state.lastFailedMessage!)}
              >
                Opnieuw proberen
              </button>
            )}
          </p>
        )}
        {speechRecognition.error && (
          <p role="alert">{speechRecognition.error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={state.status === "sending"}
            placeholder="Typ je bericht..."
          />
          <button type="submit" disabled={state.status === "sending"}>
            Versturen
          </button>
        </form>
      </main>
    </>
  );
}

export default App;
