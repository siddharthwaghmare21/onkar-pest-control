using Microsoft.AspNetCore.Mvc;
using OnkarPestControl.Api.Contracts.ContactMessages;
using OnkarPestControl.Api.Domain.Entities;
using OnkarPestControl.Api.Persistence;

namespace OnkarPestControl.Api.Controllers;

[ApiController]
[Route("api/contact-messages")]
public class ContactMessagesController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateContactMessageRequest request, CancellationToken cancellationToken)
    {
        var entity = new ContactMessage
        {
            Name = request.Name.Trim(), Phone = request.Phone.Trim(), Email = request.Email?.Trim(),
            Subject = request.Subject.Trim(), Message = request.Message.Trim()
        };
        db.ContactMessages.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return Created($"/api/contact-messages/{entity.Id}", new { id = entity.Id, status = "received" });
    }
}
