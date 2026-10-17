using Microsoft.AspNetCore.Mvc;
using RecipeGenerator.Api.Models;
using RecipeGenerator.Api.Services;

namespace RecipeGenerator.Api.Controllers;

[ApiController]
[Route("api/conversation")]
public class ConversationController(GeminiClient geminiClient) : ControllerBase
{
    [HttpPost("turn")]
    public async Task<IActionResult> Turn([FromBody] ConversationTurnRequest request, CancellationToken cancellationToken)
    {
        var systemInstruction = ConversationPromptBuilder.BuildSystemInstruction(request);
        var contents = ConversationPromptBuilder.BuildContents(request);

        for (var attempt = 1; attempt <= 2; attempt++)
        {
            try
            {
                var payload = await geminiClient.GenerateConversationTurnAsync(systemInstruction, contents, cancellationToken);
                var normalized = ConversationResponseValidator.Normalize(payload, request.PeopleCount, request.LastOfferedRecipes);
                return Ok(normalized);
            }
            catch (GeminiMalformedOutputException) when (attempt == 1)
            {
                // retry once
            }
            catch (GeminiException ex)
            {
                return Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway);
            }
        }

        return Problem(
            detail: "Gemini returned malformed output twice in a row.",
            statusCode: StatusCodes.Status502BadGateway);
    }
}
