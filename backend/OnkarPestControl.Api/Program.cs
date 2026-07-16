using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var supabaseConnection = builder.Configuration.GetConnectionString("Supabase");
if (!string.IsNullOrWhiteSpace(supabaseConnection))
{
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(SupabaseConnectionString.Normalize(supabaseConnection)));
}
var app = builder.Build();

if (!string.IsNullOrWhiteSpace(supabaseConnection))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await ServiceCatalogSeeder.SeedAsync(db);
}

// Configure the HTTP request pipeline.
app.UseAuthorization();

app.MapControllers();

app.Run();
