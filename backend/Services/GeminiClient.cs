using System.Net.Http.Json;
using System.Text.Json;

namespace RecipeGenerator.Api.Services;

public class GeminiException(string message) : Exception(message);

public class GeminiClient(IHttpClientFactory httpClientFactory, IConfiguration configuration)
{
    private const string Model = "gemini-3.5-flash-lite";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task<string> GenerateTextAsync(string prompt, CancellationToken cancellationToken = default)
    {
        var body = await SendAsync(
            new { contents = new[] { new { parts = new[] { new { text = prompt } } } } },
            cancellationToken);

        return ExtractText(body);
    }

    public async Task<GeminiTurnPayload> GenerateConversationTurnAsync(
        string systemInstruction,
        IEnumerable<(string Role, string Text)> contents,
        CancellationToken cancellationToken = default)
    {
        var requestBody = new
        {
            systemInstruction = new { parts = new[] { new { text = systemInstruction } } },
            contents = contents.Select(c => new { role = c.Role, parts = new[] { new { text = c.Text } } }),
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = ConversationResponseSchema.Schema,
            },
        };

        var body = await SendAsync(requestBody, cancellationToken);
        var text = ExtractText(body);

        try
        {
            return JsonSerializer.Deserialize<GeminiTurnPayload>(text, JsonOptions)
                   ?? throw new GeminiException("Gemini returned a null conversation payload.");
        }
        catch (JsonException ex)
        {
            throw new GeminiException($"Gemini returned malformed JSON: {ex.Message}");
        }
    }

    private async Task<string> SendAsync(object requestBody, CancellationToken cancellationToken)
    {
        var apiKey = configuration["GEMINI_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new GeminiException("GEMINI_API_KEY is not configured. Set it with `dotnet user-secrets set GEMINI_API_KEY <key>` in backend/.");
        }

        var client = httpClientFactory.CreateClient("gemini");
        var request = new HttpRequestMessage(HttpMethod.Post, $"v1beta/models/{Model}:generateContent");
        request.Headers.Add("x-goog-api-key", apiKey);
        request.Content = JsonContent.Create(requestBody);

        var response = await client.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new GeminiException($"Gemini API returned {(int)response.StatusCode}: {body}");
        }

        return body;
    }

    private static string ExtractText(string responseBody)
    {
        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(text))
        {
            throw new GeminiException("Gemini returned an empty response.");
        }

        return text;
    }
}
