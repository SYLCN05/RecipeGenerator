namespace RecipeGenerator.Api.Models;

public record ChatMessage(string Role, string Text);

public record Macros(double Calories, double ProteinGrams, double CarbsGrams, double FatGrams);

public record RecipeSummary(string Id, string Title, string ShortDescription, Macros Macros);

public record Ingredient(string Name, string Quantity);

public record RecipeDetail(
    string Id,
    string Title,
    int Servings,
    List<Ingredient> Ingredients,
    List<string> Steps,
    Macros Macros);

public record ConversationTurnRequest(
    string Language,
    int? PeopleCount,
    List<ChatMessage> History,
    List<RecipeSummary>? LastOfferedRecipes,
    string UserMessage);

public record ConversationTurnResponse(
    string Stage,
    string AssistantMessageText,
    int? PeopleCount,
    List<RecipeSummary>? Recipes,
    RecipeDetail? RecipeDetail);
