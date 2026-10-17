using RecipeGenerator.Api.Models;
using RecipeGenerator.Api.Services;

namespace RecipeGenerator.Api.Tests;

public class ConversationResponseValidatorTests
{
    private static readonly Macros SampleMacros = new(500, 30, 40, 15);

    [Fact]
    public void Normalize_AskingStage_ReturnsNoRecipesOrDetail()
    {
        var payload = new GeminiTurnPayload(
            Stage: "asking",
            AssistantMessageText: "Voor hoeveel personen kook je?",
            PeopleCount: null,
            Recipes: null,
            RecipeDetail: null);

        var result = ConversationResponseValidator.Normalize(payload, knownPeopleCount: null, lastOfferedRecipes: null);

        Assert.Equal("asking", result.Stage);
        Assert.Null(result.PeopleCount);
        Assert.Null(result.Recipes);
        Assert.Null(result.RecipeDetail);
    }

    [Fact]
    public void Normalize_RecommendingStage_AssignsSequentialBackendIds()
    {
        var payload = new GeminiTurnPayload(
            Stage: "recommending",
            AssistantMessageText: "Hier zijn een paar ideeën.",
            PeopleCount: 4,
            Recipes:
            [
                new GeminiRecipeSummary("Kip Curry", "Romige curry met kip.", SampleMacros),
                new GeminiRecipeSummary("Groentesoep", "Verse soep met seizoensgroenten.", SampleMacros),
            ],
            RecipeDetail: null);

        var result = ConversationResponseValidator.Normalize(payload, knownPeopleCount: 4, lastOfferedRecipes: null);

        Assert.Equal("recommending", result.Stage);
        Assert.Equal(4, result.PeopleCount);
        Assert.NotNull(result.Recipes);
        Assert.Equal(["0", "1"], result.Recipes!.Select(r => r.Id));
        Assert.Null(result.RecipeDetail);
    }

    [Fact]
    public void Normalize_DetailStage_ResolvesIdFromLastOfferedRecipesByTitle()
    {
        var lastOffered = new List<RecipeSummary>
        {
            new("0", "Kip Curry", "Romige curry met kip.", SampleMacros),
            new("1", "Groentesoep", "Verse soep met seizoensgroenten.", SampleMacros),
        };

        var payload = new GeminiTurnPayload(
            Stage: "detail",
            AssistantMessageText: "Hier is het recept voor de Groentesoep.",
            PeopleCount: null,
            Recipes: null,
            RecipeDetail: new GeminiRecipeDetail(
                "Groentesoep",
                [new Ingredient("Wortel", "3 stuks"), new Ingredient("Ui", "1 stuk")],
                ["Snijd de groenten.", "Laat 20 minuten sudderen."],
                SampleMacros));

        var result = ConversationResponseValidator.Normalize(payload, knownPeopleCount: 2, lastOfferedRecipes: lastOffered);

        Assert.Equal("detail", result.Stage);
        Assert.NotNull(result.RecipeDetail);
        Assert.Equal("1", result.RecipeDetail!.Id);
        Assert.Equal(2, result.RecipeDetail.Servings);
        Assert.Equal(2, result.RecipeDetail.Ingredients.Count);
    }

    [Fact]
    public void Normalize_DetailStage_FallsBackToIdZero_WhenTitleDoesNotMatchAnyOffered()
    {
        var payload = new GeminiTurnPayload(
            Stage: "detail",
            AssistantMessageText: "Hier is het recept.",
            PeopleCount: 2,
            Recipes: null,
            RecipeDetail: new GeminiRecipeDetail("Onbekend Gerecht", [], [], SampleMacros));

        var result = ConversationResponseValidator.Normalize(payload, knownPeopleCount: 2, lastOfferedRecipes: null);

        Assert.Equal("0", result.RecipeDetail!.Id);
    }

    [Fact]
    public void Normalize_RecipesPresentOnAskingStage_AreIgnored()
    {
        // The schema can't enforce "recipes only when stage=recommending" — the validator must.
        var payload = new GeminiTurnPayload(
            Stage: "asking",
            AssistantMessageText: "Nog een vraag...",
            PeopleCount: null,
            Recipes: [new GeminiRecipeSummary("Kip Curry", "...", SampleMacros)],
            RecipeDetail: null);

        var result = ConversationResponseValidator.Normalize(payload, knownPeopleCount: null, lastOfferedRecipes: null);

        Assert.Null(result.Recipes);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Normalize_MissingAssistantMessageText_Throws(string? text)
    {
        var payload = new GeminiTurnPayload("asking", text, null, null, null);

        Assert.Throws<GeminiException>(() =>
            ConversationResponseValidator.Normalize(payload, knownPeopleCount: null, lastOfferedRecipes: null));
    }

    [Fact]
    public void Normalize_UnknownStage_Throws()
    {
        var payload = new GeminiTurnPayload("cooking", "Hallo!", null, null, null);

        Assert.Throws<GeminiException>(() =>
            ConversationResponseValidator.Normalize(payload, knownPeopleCount: null, lastOfferedRecipes: null));
    }

    [Fact]
    public void Normalize_NullPayload_Throws()
    {
        Assert.Throws<GeminiException>(() =>
            ConversationResponseValidator.Normalize(null, knownPeopleCount: null, lastOfferedRecipes: null));
    }
}
