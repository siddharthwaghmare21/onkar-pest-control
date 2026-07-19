using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Contracts.ServiceRequests;
using OnkarPestControl.Api.Domain.Entities;
using OnkarPestControl.Api.Domain.Enums;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/service-requests")]
public class ServiceRequestsController(AppDbContext db) : ControllerBase
{
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
                PropertyType = request.PropertyType,
                PreferredDate = request.PreferredDate,
                PreferredTime = request.PreferredTime,
                ProblemDescription = request.ProblemDescription,
                Status = request.Status.ToString(),
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
            ServiceId = request.ServiceId, PropertyType = request.PropertyType.Trim(), PreferredDate = request.PreferredDate,
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

    private Guid? GetAuthenticatedUserId()
    {
        if (User.Identity?.IsAuthenticated != true)
            return null;

        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(subject, out var userId) ? userId : null;
    }
}
