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

        GeminiTurnPayload payload;
        try
        {
            payload = await geminiClient.GenerateConversationTurnAsync(systemInstruction, contents, cancellationToken);
        }
        catch (GeminiException ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway);
        }

        try
        {
            var normalized = ConversationResponseValidator.Normalize(payload, request.PeopleCount, request.LastOfferedRecipes);
            return Ok(normalized);
        }
        catch (GeminiException ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
