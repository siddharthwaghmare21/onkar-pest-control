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
    [HttpPost]
    public async Task<IActionResult> Create(CreateServiceRequestRequest request, CancellationToken cancellationToken)
    {
        if (request.ServiceId.HasValue && !await db.Services.AnyAsync(x => x.Id == request.ServiceId && x.IsActive, cancellationToken))
            return BadRequest(new { message = "Selected service is not available." });

        var entity = new ServiceRequest
        {
            FullName = request.FullName.Trim(), Phone = request.Phone.Trim(), Email = request.Email?.Trim(),
            Address = request.Address.Trim(), City = request.City.Trim(), Pincode = request.Pincode.Trim(),
            ServiceId = request.ServiceId, PropertyType = request.PropertyType.Trim(), PreferredDate = request.PreferredDate,
            PreferredTime = request.PreferredTime?.Trim(), ProblemDescription = request.ProblemDescription.Trim(),
            Status = ServiceRequestStatus.New
        };
        db.ServiceRequests.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return Created($"/api/service-requests/{entity.Id}", new { id = entity.Id, status = "new" });
    }
}
