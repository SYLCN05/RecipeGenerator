using Microsoft.EntityFrameworkCore;
using RecipeGenerator.Api.Data;
using RecipeGenerator.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient("gemini", client =>
{
    client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
    client.Timeout = TimeSpan.FromSeconds(20);
});
builder.Services.AddScoped<GeminiClient>();

const string DevCorsPolicy = "DevCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(DevCorsPolicy);

    app.MapGet("/api/gemini/ping", async (GeminiClient geminiClient) =>
    {
        try
        {
            var text = await geminiClient.GenerateTextAsync("Say hello in one short sentence.");
            return Results.Ok(new { text });
        }
        catch (GeminiException ex)
        {
            return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status502BadGateway);
        }
    });
}

app.UseAuthorization();

app.MapControllers();

app.Run();
