using System.Text;
using RecipeGenerator.Api.Models;

namespace RecipeGenerator.Api.Services;

public static class ConversationPromptBuilder
{
    public static string BuildSystemInstruction(ConversationTurnRequest request)
    {
        var languageName = request.Language == "tr" ? "Turkish (tr-TR)" : "Dutch (nl-NL)";

        var sb = new StringBuilder();
        sb.AppendLine($"You are a friendly cooking assistant helping someone decide what to cook tonight. " +
                       $"Reply only in {languageName} — never switch language mid-conversation.");
        sb.AppendLine("Stay in stage \"asking\", asking one short follow-up question at a time, until you know " +
                       "(a) a rough food steer (e.g. protein-heavy, vegetarian, soup — doesn't need to be an exact dish) " +
                       "and (b) the number of people being cooked for. The number of people is mandatory before you " +
                       "can leave \"asking\" — always ask for it if it isn't known yet.");
        sb.AppendLine("Once both are known, switch to stage \"recommending\" and return 3 to 5 recipe ideas with " +
                       "estimated macros. Do not ask further questions in that turn.");
        sb.AppendLine("If the user is selecting one of the recipes you already offered (by name or position, e.g. " +
                       "\"the second one\"), switch to stage \"detail\" and return the full recipe (ingredients, " +
                       "steps, macros) for exactly that recipe, scaled to the known number of people. Leave the " +
                       "recipes list empty in that turn. The recipeDetail.title field must be copied exactly as-is " +
                       "from the title you previously offered — do not add servings, descriptions, or any other " +
                       "text to it. Ingredients, steps, and macros must always be filled in for a \"detail\" turn — " +
                       "never leave them empty.");
        sb.AppendLine("Macros are always estimates — there is no nutrition database behind this — phrase them as " +
                       "reasonable estimates, not exact figures.");
        sb.AppendLine();
        sb.AppendLine($"Known so far: peopleCount = {(request.PeopleCount?.ToString() ?? "unknown")}.");

        if (request.LastOfferedRecipes is { Count: > 0 })
        {
            sb.AppendLine("Recipes you already offered this conversation (for resolving the user's selection):");
            foreach (var recipe in request.LastOfferedRecipes)
            {
                sb.AppendLine($"- id {recipe.Id}: {recipe.Title} — {recipe.ShortDescription}");
            }
        }

        return sb.ToString();
    }

    public static List<(string Role, string Text)> BuildContents(ConversationTurnRequest request)
    {
        var contents = request.History
            .Select(h => (Role: h.Role == "assistant" ? "model" : "user", Text: h.Text))
            .ToList();
        contents.Add(("user", request.UserMessage));
        return contents;
    }
}
