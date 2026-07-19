using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnkarPestControl.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
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
