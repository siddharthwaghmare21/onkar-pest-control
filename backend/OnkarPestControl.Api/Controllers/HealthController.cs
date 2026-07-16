using Microsoft.AspNetCore.Mvc;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        status = "ok",
        service = "Onkar Pest Control API"
    });
}
