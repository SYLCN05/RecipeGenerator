import { MacroRing } from './MacroRing'
import { MACRO_REFERENCE_MAX as REFERENCE_MAX, MACRO_RING_COLOR as COLOR } from './macroReference'
import type { RecipeDetail } from './types'

interface RecipeDetailViewProps {
  recipeDetail: RecipeDetail
  onBackToList: (() => void) | null
}

export function RecipeDetailView({ recipeDetail, onBackToList }: RecipeDetailViewProps) {
  return (
    <section className="recipe-detail">
      {onBackToList && (
        <button type="button" className="recipe-detail-back" onClick={onBackToList}>
          ← Terug naar overzicht
        </button>
      )}
      <h2>
        {recipeDetail.title} <span className="servings-badge">voor {recipeDetail.servings} personen</span>
      </h2>
      <h3>Ingrediënten</h3>
      <ul>
        {recipeDetail.ingredients.map((ingredient, i) => (
          <li key={i}>
            {ingredient.quantity} {ingredient.name}
          </li>
        ))}
      </ul>
      <h3>Bereiding</h3>
      <ol>
        {recipeDetail.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <div className="macro-ring-row">
        <MacroRing
          value={recipeDetail.macros.calories}
          max={REFERENCE_MAX.calories}
          unit=""
          label="Calorieën"
          color={COLOR.calories}
        />
        <MacroRing
          value={recipeDetail.macros.proteinGrams}
          max={REFERENCE_MAX.proteinGrams}
          unit="g"
          label="Eiwitten"
          color={COLOR.proteinGrams}
        />
        <MacroRing
          value={recipeDetail.macros.carbsGrams}
          max={REFERENCE_MAX.carbsGrams}
          unit="g"
          label="Koolhydraten"
          color={COLOR.carbsGrams}
        />
        <MacroRing
          value={recipeDetail.macros.fatGrams}
          max={REFERENCE_MAX.fatGrams}
          unit="g"
          label="Vetten"
          color={COLOR.fatGrams}
        />
      </div>
      <p className="macro-note">Voedingswaarden zijn geschat, per portie.</p>
    </section>
  )
}
