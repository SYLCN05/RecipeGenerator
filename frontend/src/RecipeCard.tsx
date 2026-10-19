import { MacroRing } from './MacroRing'
import { MACRO_REFERENCE_MAX as REFERENCE_MAX, MACRO_RING_COLOR as COLOR } from './macroReference'
import type { RecipeSummary } from './types'

interface RecipeCardProps {
  recipe: RecipeSummary
  onSelect: (recipe: RecipeSummary) => void
}

export function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  return (
    <li className="recipe-card">
      <h3>{recipe.title}</h3>
      <p className="recipe-card-description">{recipe.shortDescription}</p>
      <div className="macro-ring-row">
        <MacroRing
          value={recipe.macros.calories}
          max={REFERENCE_MAX.calories}
          unit=""
          label="Calorieën"
          color={COLOR.calories}
        />
        <MacroRing
          value={recipe.macros.proteinGrams}
          max={REFERENCE_MAX.proteinGrams}
          unit="g"
          label="Eiwitten"
          color={COLOR.proteinGrams}
        />
        <MacroRing
          value={recipe.macros.carbsGrams}
          max={REFERENCE_MAX.carbsGrams}
          unit="g"
          label="Koolhydraten"
          color={COLOR.carbsGrams}
        />
        <MacroRing
          value={recipe.macros.fatGrams}
          max={REFERENCE_MAX.fatGrams}
          unit="g"
          label="Vetten"
          color={COLOR.fatGrams}
        />
      </div>
      <button type="button" onClick={() => onSelect(recipe)}>
        Vertel me meer
      </button>
    </li>
  )
}
