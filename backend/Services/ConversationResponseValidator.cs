using RecipeGenerator.Api.Models;

namespace RecipeGenerator.Api.Services;

/// <summary>
/// Normalizes and validates Gemini's deserialized turn payload into the backend's response contract.
/// This is the actual state-machine correctness boundary (schema alone can't enforce "recipes only
/// when stage=recommending"), so it's kept callable without an HTTP round trip for unit testing.
/// </summary>
public static class ConversationResponseValidator
{
    private static readonly HashSet<string> ValidStages = ["asking", "recommending", "detail"];

    public static ConversationTurnResponse Normalize(
        GeminiTurnPayload? payload,
        int? knownPeopleCount,
        List<RecipeSummary>? lastOfferedRecipes)
    {
        if (payload is null)
        {
            throw new GeminiException("Gemini returned no payload.");
        }

        if (string.IsNullOrWhiteSpace(payload.AssistantMessageText))
        {
            throw new GeminiException("Gemini response is missing assistantMessageText.");
        }

        if (payload.Stage is null || !ValidStages.Contains(payload.Stage))
        {
            throw new GeminiException($"Gemini response has an unrecognized stage: '{payload.Stage}'.");
        }

        var stage = payload.Stage;
        var peopleCount = payload.PeopleCount ?? knownPeopleCount;

        List<RecipeSummary>? recipes = null;
        if (stage == "recommending" && payload.Recipes is { Count: > 0 })
        {
            recipes = payload.Recipes
                .Select((r, i) => new RecipeSummary(i.ToString(), r.Title, r.ShortDescription, r.Macros))
                .ToList();
        }

        RecipeDetail? recipeDetail = null;
        if (stage == "detail" && payload.RecipeDetail is not null)
        {
            var matchedId = lastOfferedRecipes?
                .FirstOrDefault(r => string.Equals(r.Title, payload.RecipeDetail.Title, StringComparison.OrdinalIgnoreCase))
                ?.Id ?? "0";

            recipeDetail = new RecipeDetail(
                matchedId,
                payload.RecipeDetail.Title,
                peopleCount ?? 1,
                payload.RecipeDetail.Ingredients,
                payload.RecipeDetail.Steps,
                payload.RecipeDetail.Macros);
        }

        return new ConversationTurnResponse(stage, payload.AssistantMessageText, peopleCount, recipes, recipeDetail);
    }
}
