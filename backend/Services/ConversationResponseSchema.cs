namespace RecipeGenerator.Api.Services;

/// <summary>
/// Gemini's `generationConfig.responseSchema` for a conversation turn. Gemini's schema support is a
/// flat subset of JSON Schema (no real discriminated unions), so this mirrors the full response shape
/// with `recipes`/`recipeDetail` both nullable rather than fighting the format.
/// </summary>
public static class ConversationResponseSchema
{
    private static readonly object MacrosSchema = new
    {
        type = "object",
        properties = new
        {
            calories = new { type = "number" },
            proteinGrams = new { type = "number" },
            carbsGrams = new { type = "number" },
            fatGrams = new { type = "number" },
        },
        required = new[] { "calories", "proteinGrams", "carbsGrams", "fatGrams" },
    };

    public static readonly object Schema = new
    {
        type = "object",
        properties = new
        {
            stage = new { type = "string", @enum = new[] { "asking", "recommending", "detail" } },
            assistantMessageText = new { type = "string" },
            peopleCount = new { type = "integer", nullable = true },
            recipes = new
            {
                type = "array",
                nullable = true,
                items = new
                {
                    type = "object",
                    properties = new
                    {
                        title = new { type = "string" },
                        shortDescription = new { type = "string" },
                        macros = MacrosSchema,
                    },
                    required = new[] { "title", "shortDescription", "macros" },
                },
            },
            recipeDetail = new
            {
                type = "object",
                nullable = true,
                properties = new
                {
                    title = new { type = "string" },
                    ingredients = new
                    {
                        type = "array",
                        items = new
                        {
                            type = "object",
                            properties = new
                            {
                                name = new { type = "string" },
                                quantity = new { type = "string" },
                            },
                            required = new[] { "name", "quantity" },
                        },
                    },
                    steps = new { type = "array", items = new { type = "string" } },
                    macros = MacrosSchema,
                },
                required = new[] { "title", "ingredients", "steps", "macros" },
            },
        },
        required = new[] { "stage", "assistantMessageText" },
    };
}
