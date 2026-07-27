using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnkarPestControl.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddAuthorization();
var frontendOrigin = builder.Configuration["FrontendOrigin"] ?? "http://localhost:3000";
builder.Services.AddCors(options => options.AddPolicy("frontend", policy => policy.WithOrigins(frontendOrigin).AllowAnyHeader().AllowAnyMethod()));

var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseJwtSecret = builder.Configuration["Supabase:JwtSecret"];
var supabaseAudience = builder.Configuration["Supabase:Audience"] ?? "authenticated";
var authConfigured = !string.IsNullOrWhiteSpace(supabaseUrl) && !string.IsNullOrWhiteSpace(supabaseJwtSecret);

if (authConfigured)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = $"{supabaseUrl!.TrimEnd('/')}/auth/v1",
                ValidateAudience = true,
                ValidAudience = supabaseAudience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseJwtSecret!))
            };
        });
}

var supabaseConnection = builder.Configuration.GetConnectionString("Supabase");
if (!string.IsNullOrWhiteSpace(supabaseConnection))
{
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(SupabaseConnectionString.Normalize(supabaseConnection)));
}
var app = builder.Build();
app.UseCors("frontend");
if (authConfigured)
{
    app.UseAuthentication();
}

// Serve static files (uploads) from wwwroot
app.UseStaticFiles();

if (!string.IsNullOrWhiteSpace(supabaseConnection))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await ServiceCatalogSeeder.SeedAsync(db);
}

// Safety: require Admin emails in Production to avoid accidentally exposing admin functionality.
// The environment variable key consumed by ASP.NET Core can be Admin:Emails or Admin__Emails (double-underscore form).
if (app.Environment.IsProduction())
{
    var adminEmails = builder.Configuration["Admin:Emails"] ?? builder.Configuration["Admin__Emails"];
    if (string.IsNullOrWhiteSpace(adminEmails))
    {
        Console.Error.WriteLine("FATAL: Admin emails are not configured. Set Admin__Emails (comma-separated) before starting in Production.");
        // Exit early to avoid running the app with open admin access.
        return;
    }
}

// Configure the HTTP request pipeline.
app.UseAuthorization();

app.MapControllers();

app.Run();
