using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnkarPestControl.Api.Domain.Entities;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/gallery")]
public class GalleryUploadController(AppDbContext db, IWebHostEnvironment environment, IConfiguration configuration) : ControllerBase
{
    [Authorize]
    [HttpPost("admin/upload")]
    public async Task<IActionResult> UploadAdmin([FromForm] IFormFile file, [FromForm] string captionEnglish, [FromForm] string captionMarathi, [FromForm] int displayOrder = 10, [FromForm] bool isActive = true)
    {
        if (!IsAdminUser())
            return Forbid();

        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        // Ensure uploads path exists
        var uploadsRoot = Path.Combine(environment.ContentRootPath, "wwwroot", "uploads", "gallery");
        if (!Directory.Exists(uploadsRoot)) Directory.CreateDirectory(uploadsRoot);

        var originalFileName = Path.GetFileName(file.FileName);
        var safeFileName = originalFileName.Replace(" ", "-").Replace("..", "");
        var filename = $"{DateTime.UtcNow.Ticks}-{safeFileName}";
        var filePath = Path.Combine(uploadsRoot, filename);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var publicBase = GetPublicBaseUrl();
        var publicUrl = $"{publicBase}/uploads/gallery/{filename}";

        var entity = new GalleryItem
        {
            ImageUrl = publicUrl,
            CaptionEnglish = captionEnglish ?? string.Empty,
            CaptionMarathi = captionMarathi ?? string.Empty,
            DisplayOrder = displayOrder,
            IsActive = isActive,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.GalleryItems.Add(entity);
        await db.SaveChangesAsync();

        return Created($"/api/gallery/admin/{entity.Id}", new { entity.Id, entity.ImageUrl, entity.CaptionEnglish, entity.CaptionMarathi, entity.IsActive, entity.DisplayOrder, entity.CreatedAtUtc });
    }

    private string GetPublicBaseUrl()
    {
        // Prefer configuration override if provided (e.g., PUBLIC_BASE_URL), else infer from request
        var configured = configuration["PublicBaseUrl"];
        if (!string.IsNullOrWhiteSpace(configured)) return configured.TrimEnd('/');

        var scheme = Request.Scheme;
        var host = Request.Host.Value;
        return $"{scheme}://{host}";
    }

    private bool IsAdminUser()
    {
        if (User.Identity?.IsAuthenticated != true)
            return false;

        if (User.IsInRole("admin") || User.FindFirstValue("role") == "admin")
            return true;

        if (IsAdminEmail() || HasMetadataRole("app_metadata") || HasMetadataRole("user_metadata"))
            return true;

        return environment.IsDevelopment() && string.IsNullOrWhiteSpace(configuration["Admin:Emails"]);
    }

    private bool IsAdminEmail()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var adminEmails = configuration["Admin:Emails"]?.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) ?? new string[0];

        return adminEmails.Any(adminEmail => string.Equals(adminEmail, email, StringComparison.OrdinalIgnoreCase));
    }

    private bool HasMetadataRole(string claimType)
    {
        var metadata = User.FindFirstValue(claimType);
        if (string.IsNullOrWhiteSpace(metadata))
            return false;

        try
        {
            using var document = System.Text.Json.JsonDocument.Parse(metadata);
            return document.RootElement.TryGetProperty("role", out var role) && role.GetString() == "admin";
        }
        catch (System.Text.Json.JsonException)
        {
            return false;
        }
    }
}