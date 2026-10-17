using RecipeGenerator.Api.Models;

namespace RecipeGenerator.Api.Services;

// Shape of the JSON Gemini returns per `ConversationResponseSchema` — intentionally missing
// `id`/`servings`, which the backend fills in (see ConversationResponseValidator).

public record GeminiRecipeSummary(string Title, string ShortDescription, Macros Macros);

public record GeminiRecipeDetail(string Title, List<Ingredient> Ingredients, List<string> Steps, Macros Macros);

public record GeminiTurnPayload(
    string? Stage,
    string? AssistantMessageText,
    int? PeopleCount,
    List<GeminiRecipeSummary>? Recipes,
    GeminiRecipeDetail? RecipeDetail);
