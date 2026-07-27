using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Contracts.Offers;
using OnkarPestControl.Api.Domain.Entities;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/offers")]
public class OffersController(AppDbContext db, IWebHostEnvironment environment, IConfiguration configuration) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetActiveOffers(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var offers = await db.Offers
            .AsNoTracking()
            .Where(offer => offer.IsActive && offer.StartsAtUtc <= now && offer.EndsAtUtc >= now)
            .OrderByDescending(offer => offer.StartsAtUtc)
            .Select(offer => ToResponse(offer))
            .ToListAsync(cancellationToken);

        return Ok(offers);
    }

    [Authorize]
    [HttpGet("admin")]
    public async Task<IActionResult> AdminList(CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var offers = await db.Offers
            .AsNoTracking()
            .OrderByDescending(offer => offer.CreatedAtUtc)
            .Select(offer => ToResponse(offer))
            .ToListAsync(cancellationToken);

        return Ok(offers);
    }

    [Authorize]
    [HttpPost("admin")]
    public async Task<IActionResult> AdminCreate(UpsertOfferRequest request, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        if (request.EndsAtUtc <= request.StartsAtUtc)
            return BadRequest(new { message = "Offer end date must be after the start date." });

        var entity = new Offer();
        ApplyRequest(entity, request);

        db.Offers.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Created($"/api/offers/admin/{entity.Id}", ToResponse(entity));
    }

    [Authorize]
    [HttpPatch("admin/{id:guid}")]
    public async Task<IActionResult> AdminUpdate(Guid id, UpsertOfferRequest request, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var entity = await db.Offers.FindAsync([id], cancellationToken);
        if (entity is null)
            return NotFound(new { message = "Offer not found." });

        if (request.EndsAtUtc <= request.StartsAtUtc)
            return BadRequest(new { message = "Offer end date must be after the start date." });

        ApplyRequest(entity, request);
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

        var entity = await db.Offers.FindAsync([id], cancellationToken);
        if (entity is null)
            return NotFound(new { message = "Offer not found." });

        entity.IsActive = false;
        entity.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(ToResponse(entity));
    }

    private static OfferAdminResponse ToResponse(Offer offer)
    {
        return new OfferAdminResponse
        {
            Id = offer.Id,
            Title = offer.Title,
            Description = offer.Description,
            DiscountType = offer.DiscountType,
            DiscountValue = offer.DiscountValue,
            StartsAtUtc = offer.StartsAtUtc,
            EndsAtUtc = offer.EndsAtUtc,
            IsActive = offer.IsActive,
            RegisteredCustomersOnly = offer.RegisteredCustomersOnly,
            CreatedAtUtc = offer.CreatedAtUtc,
            UpdatedAtUtc = offer.UpdatedAtUtc
        };
    }

    private static void ApplyRequest(Offer offer, UpsertOfferRequest request)
    {
        offer.Title = request.Title.Trim();
        offer.Description = request.Description.Trim();
        offer.DiscountType = request.DiscountType.Trim().ToLowerInvariant();
        offer.DiscountValue = request.DiscountValue;
        offer.StartsAtUtc = request.StartsAtUtc;
        offer.EndsAtUtc = request.EndsAtUtc;
        offer.IsActive = request.IsActive;
        offer.RegisteredCustomersOnly = request.RegisteredCustomersOnly;
        offer.UpdatedAtUtc = DateTime.UtcNow;
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
