using System.ComponentModel.DataAnnotations;

namespace OnkarPestControl.Api.Contracts.ContactMessages;

public class CreateContactMessageRequest
{
    [Required, StringLength(120)] public string Name { get; set; } = string.Empty;
    [Required, RegularExpression("^[0-9]{10}$")] public string Phone { get; set; } = string.Empty;
    [EmailAddress] public string? Email { get; set; }
    [Required, StringLength(160)] public string Subject { get; set; } = string.Empty;
    [Required, StringLength(3000)] public string Message { get; set; } = string.Empty;
}
