using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Contracts.ServiceRequests;
using OnkarPestControl.Api.Domain.Entities;
using OnkarPestControl.Api.Domain.Enums;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/service-requests")]
public class ServiceRequestsController(AppDbContext db, IWebHostEnvironment environment, IConfiguration configuration) : ControllerBase
{
    [Authorize]
    [HttpGet("admin")]
    public async Task<IActionResult> AdminList(CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var requests = (await db.ServiceRequests
            .OrderByDescending(request => request.CreatedAtUtc)
            .ToListAsync(cancellationToken))
            .Select(ToAdminResponse)
            .ToList();

        return Ok(requests);
    }

    [Authorize]
    [HttpPatch("admin/{id:guid}")]
    public async Task<IActionResult> AdminUpdate(Guid id, UpdateServiceRequestAdminRequest request, CancellationToken cancellationToken)
    {
        if (!IsAdminUser())
            return Forbid();

        var entity = await db.ServiceRequests.FindAsync([id], cancellationToken);
        if (entity is null)
            return NotFound(new { message = "Service request not found." });

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (!Enum.TryParse<ServiceRequestStatus>(request.Status, true, out var status))
                return BadRequest(new { message = "Invalid service request status." });

            entity.Status = status;
        }

        entity.ServiceName = CleanOptional(request.ServiceName) ?? entity.ServiceName;
        entity.LeadSource = CleanOptional(request.LeadSource) ?? entity.LeadSource;
        entity.AdminNote = CleanOptional(request.AdminNote) ?? entity.AdminNote;
        entity.ServiceAmount = request.ServiceAmount ?? entity.ServiceAmount;
        entity.AdvancePaid = request.AdvancePaid ?? entity.AdvancePaid;
        entity.PaymentStatus = CleanOptional(request.PaymentStatus) ?? entity.PaymentStatus;
        entity.PaymentMode = CleanOptional(request.PaymentMode) ?? entity.PaymentMode;
        entity.InvoiceNumber = CleanOptional(request.InvoiceNumber) ?? entity.InvoiceNumber;
        entity.CompletedAtUtc = request.CompletedAtUtc ?? entity.CompletedAtUtc;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return Ok(ToAdminResponse(entity));
    }

    [HttpGet("my")]
    public async Task<IActionResult> My(CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        if (userId is null)
            return Unauthorized(new { message = "Please sign in to view service requests." });

        var requests = await db.ServiceRequests
            .Where(request => request.CustomerUserId == userId)
            .OrderByDescending(request => request.CreatedAtUtc)
            .Select(request => new ServiceRequestSummaryResponse
            {
                Id = request.Id,
                ServiceName = request.ServiceName,
                LeadSource = request.LeadSource,
                PropertyType = request.PropertyType,
                PreferredDate = request.PreferredDate,
                PreferredTime = request.PreferredTime,
                ProblemDescription = request.ProblemDescription,
                Status = request.Status.ToString(),
                PaymentStatus = request.PaymentStatus,
                CreatedAtUtc = request.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(requests);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateServiceRequestRequest request, CancellationToken cancellationToken)
    {
        if (request.ServiceId.HasValue && !await db.Services.AnyAsync(x => x.Id == request.ServiceId && x.IsActive, cancellationToken))
            return BadRequest(new { message = "Selected service is not available." });

        var customerUserId = await EnsureCustomerUserAsync(request, cancellationToken);

        var entity = new ServiceRequest
        {
            FullName = request.FullName.Trim(), Phone = request.Phone.Trim(), Email = request.Email?.Trim(),
            Address = request.Address.Trim(), City = request.City.Trim(), Pincode = request.Pincode.Trim(),
            ServiceId = request.ServiceId, ServiceName = CleanOptional(request.ServiceName), LeadSource = CleanOptional(request.LeadSource) ?? "Website",
            PropertyType = request.PropertyType.Trim(), PreferredDate = request.PreferredDate,
            PreferredTime = request.PreferredTime?.Trim(), ProblemDescription = request.ProblemDescription.Trim(),
            Status = ServiceRequestStatus.New, CustomerUserId = customerUserId
        };
        db.ServiceRequests.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return Created($"/api/service-requests/{entity.Id}", new { id = entity.Id, status = "new" });
    }

    private async Task<Guid?> EnsureCustomerUserAsync(CreateServiceRequestRequest request, CancellationToken cancellationToken)
    {
        if (User.Identity?.IsAuthenticated != true)
            return null;

        var userId = GetAuthenticatedUserId();
        if (userId is null)
            return null;

        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email") ?? request.Email;
        var existingUser = await db.Users.FindAsync([userId.Value], cancellationToken);
        if (existingUser is null)
        {
            db.Users.Add(new User
            {
                Id = userId.Value,
                FullName = request.FullName.Trim(),
                Phone = request.Phone.Trim(),
                Email = email?.Trim() ?? string.Empty,
                Address = request.Address.Trim(),
                City = request.City.Trim(),
                Role = "customer"
            });
        }
        else
        {
            existingUser.FullName = request.FullName.Trim();
            existingUser.Phone = request.Phone.Trim();
            existingUser.Email = email?.Trim() ?? existingUser.Email;
            existingUser.Address = request.Address.Trim();
            existingUser.City = request.City.Trim();
            existingUser.UpdatedAtUtc = DateTime.UtcNow;
        }

        return userId;
    }

    private static AdminServiceRequestResponse ToAdminResponse(ServiceRequest request)
    {
        return new AdminServiceRequestResponse
        {
            Id = request.Id,
            CustomerUserId = request.CustomerUserId,
            ServiceName = request.ServiceName,
            FullName = request.FullName,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            City = request.City,
            Pincode = request.Pincode,
            LeadSource = request.LeadSource,
            PropertyType = request.PropertyType,
            PreferredDate = request.PreferredDate,
            PreferredTime = request.PreferredTime,
            ProblemDescription = request.ProblemDescription,
            Status = request.Status.ToString(),
            AdminNote = request.AdminNote,
            ServiceAmount = request.ServiceAmount,
            AdvancePaid = request.AdvancePaid,
            BalanceAmount = request.ServiceAmount.HasValue ? request.ServiceAmount.Value - (request.AdvancePaid ?? 0) : null,
            PaymentStatus = request.PaymentStatus,
            PaymentMode = request.PaymentMode,
            InvoiceNumber = request.InvoiceNumber,
            CompletedAtUtc = request.CompletedAtUtc,
            CreatedAtUtc = request.CreatedAtUtc,
            UpdatedAtUtc = request.UpdatedAtUtc
        };
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
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

    private Guid? GetAuthenticatedUserId()
    {
        if (User.Identity?.IsAuthenticated != true)
            return null;

        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(subject, out var userId) ? userId : null;
    }
}
