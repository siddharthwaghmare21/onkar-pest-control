using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Contracts.Services;
using OnkarPestControl.Api.Domain.Entities;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController(AppDbContext db, IWebHostEnvironment environment, IConfiguration configuration) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetActiveServices(CancellationToken cancellationToken)
    {
        var services = await db.Services
            .AsNoTracking()
            .Where(service => service.IsActive)
            .OrderBy(service => service.DisplayOrder)
            .Select(service => new
            {
                service.Id,
                service.NameEnglish,
                service.NameMarathi,
                service.Slug,
                service.DescriptionEnglish,
                service.DescriptionMarathi,
                service.ImageUrl,
                service.StartingPrice,
                service.OfferPrice
            })
            .ToListAsync(cancellationToken);

        return Ok(services);
    }

    [Authorize]
    [HttpGet("admin")]
    public async Task<IActionResult> AdminList(CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var services = await db.Services
            .AsNoTracking()
            .OrderBy(service => service.DisplayOrder)
            .ThenBy(service => service.NameEnglish)
            .Select(service => ToResponse(service))
            .ToListAsync(cancellationToken);

        return Ok(services);
    }

    [Authorize]
    [HttpPost("admin")]
    public async Task<IActionResult> AdminCreate(UpsertServiceRequest request, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var slug = request.Slug.Trim().ToLowerInvariant();
        if (await db.Services.AnyAsync(service => service.Slug == slug, cancellationToken))
            return BadRequest(new { message = "Service slug already exists." });

        var entity = new Service();
        ApplyRequest(entity, request);
        entity.Slug = slug;

        db.Services.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Created($"/api/services/admin/{entity.Id}", ToResponse(entity));
    }

    [Authorize]
    [HttpPatch("admin/{id:guid}")]
    public async Task<IActionResult> AdminUpdate(Guid id, UpsertServiceRequest request, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var entity = await db.Services.FindAsync([id], cancellationToken);
        if (entity is null)
            return NotFound(new { message = "Service not found." });

        var slug = request.Slug.Trim().ToLowerInvariant();
        if (await db.Services.AnyAsync(service => service.Id != id && service.Slug == slug, cancellationToken))
            return BadRequest(new { message = "Service slug already exists." });

        ApplyRequest(entity, request);
        entity.Slug = slug;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(entity));
    }

    [Authorize]
    [HttpDelete("admin/{id:guid}")]
    public async Task<IActionResult> AdminDelete(Guid id, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var entity = await db.Services.FindAsync([id], cancellationToken);
        if (entity is null)
            return NotFound(new { message = "Service not found." });

        entity.IsActive = false;
        entity.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(entity));
    }

    private static ServiceAdminResponse ToResponse(Service service)
    {
        return new ServiceAdminResponse
        {
            Id = service.Id,
            NameEnglish = service.NameEnglish,
            NameMarathi = service.NameMarathi,
            Slug = service.Slug,
            DescriptionEnglish = service.DescriptionEnglish,
            DescriptionMarathi = service.DescriptionMarathi,
            StartingPrice = service.StartingPrice,
            OfferPrice = service.OfferPrice,
            IsActive = service.IsActive,
            DisplayOrder = service.DisplayOrder
        };
    }

    private static void ApplyRequest(Service service, UpsertServiceRequest request)
    {
        service.NameEnglish = request.NameEnglish.Trim();
        service.NameMarathi = request.NameMarathi.Trim();
        service.DescriptionEnglish = request.DescriptionEnglish.Trim();
        service.DescriptionMarathi = request.DescriptionMarathi.Trim();
        service.StartingPrice = request.StartingPrice;
        service.OfferPrice = request.OfferPrice;
        service.IsActive = request.IsActive;
        service.DisplayOrder = request.DisplayOrder;
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
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) ?? [];

        return adminEmails.Any(adminEmail => string.Equals(adminEmail, email, StringComparison.OrdinalIgnoreCase));
    }

    private bool HasMetadataRole(string claimType)
    {
        var metadata = User.FindFirstValue(claimType);
        if (string.IsNullOrWhiteSpace(metadata))
            return false;

        try
        {
            using var document = JsonDocument.Parse(metadata);
            return document.RootElement.TryGetProperty("role", out var role) && role.GetString() == "admin";
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
