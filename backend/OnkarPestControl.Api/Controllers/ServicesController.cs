using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController(AppDbContext db) : ControllerBase
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
                service.ImageUrl
            })
            .ToListAsync(cancellationToken);

        return Ok(services);
    }
}
