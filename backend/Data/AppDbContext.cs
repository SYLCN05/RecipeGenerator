using Microsoft.EntityFrameworkCore;

namespace RecipeGenerator.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}
