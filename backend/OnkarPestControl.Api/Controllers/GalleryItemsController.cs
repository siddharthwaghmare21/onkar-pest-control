using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Domain.Entities;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/gallery")]
public class GalleryItemsController(AppDbContext db, IWebHostEnvironment environment, IConfiguration configuration) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
    {
        var items = await db.GalleryItems
            .AsNoTracking()
            .Where(i => i.IsActive)
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new
            {
                i.Id,
                i.ImageUrl,
                i.CaptionEnglish,
                i.CaptionMarathi,
                i.DisplayOrder
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [Authorize]
    [HttpGet("admin")]
    public async Task<IActionResult> AdminList(CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var items = await db.GalleryItems
            .AsNoTracking()
            .OrderBy(i => i.DisplayOrder)
            .Select(i => ToResponse(i))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [Authorize]
    [HttpPost("admin")]
    public async Task<IActionResult> AdminCreate(UpsertGalleryItemRequest request, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var entity = new GalleryItem();
        ApplyRequest(entity, request);
        db.GalleryItems.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Created($"/api/gallery/admin/{entity.Id}", ToResponse(entity));
    }

    [Authorize]
    [HttpPatch("admin/{id:guid}")]
    public async Task<IActionResult> AdminUpdate(Guid id, UpsertGalleryItemRequest request, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var entity = await db.GalleryItems.FindAsync([id], cancellationToken);
        if (entity is null)
            return NotFound(new { message = "Gallery item not found." });

        ApplyRequest(entity, request);
        entity.CreatedAtUtc = entity.CreatedAtUtc; // keep created
        await db.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(entity));
    }

    [Authorize]
    [HttpDelete("admin/{id:guid}")]
    public async Task<IActionResult> AdminDelete(Guid id, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var entity = await db.GalleryItems.FindAsync([id], cancellationToken);
        if (entity is null)
            return NotFound(new { message = "Gallery item not found." });

        entity.IsActive = false;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(entity));
    }

    private static object ToResponse(GalleryItem item)
    {
        return new
        {
            item.Id,
            item.ImageUrl,
            item.CaptionEnglish,
            item.CaptionMarathi,
            item.IsActive,
            item.DisplayOrder,
            item.CreatedAtUtc
        };
    }

    private static void ApplyRequest(GalleryItem item, UpsertGalleryItemRequest request)
    {
        item.ImageUrl = request.ImageUrl?.Trim() ?? string.Empty;
        item.CaptionEnglish = request.CaptionEnglish?.Trim() ?? string.Empty;
        item.CaptionMarathi = request.CaptionMarathi?.Trim() ?? string.Empty;
        item.IsActive = request.IsActive;
        item.DisplayOrder = request.DisplayOrder;
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

        var adminEmails = configuration["Admin:Emails"]?
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) ?? new string[0];

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

    public record UpsertGalleryItemRequest
    (
        string ImageUrl,
        string CaptionEnglish,
        string CaptionMarathi,
        bool IsActive,
        int DisplayOrder
    );
}