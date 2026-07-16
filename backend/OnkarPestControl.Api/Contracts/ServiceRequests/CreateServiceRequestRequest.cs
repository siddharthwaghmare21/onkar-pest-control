using System.ComponentModel.DataAnnotations;

namespace OnkarPestControl.Api.Contracts.ServiceRequests;

public class CreateServiceRequestRequest
{
    [Required, StringLength(120)] public string FullName { get; set; } = string.Empty;
    [Required, RegularExpression("^[0-9]{10}$")] public string Phone { get; set; } = string.Empty;
    [EmailAddress] public string? Email { get; set; }
    [Required, StringLength(500)] public string Address { get; set; } = string.Empty;
    [Required, StringLength(80)] public string City { get; set; } = string.Empty;
    [Required, RegularExpression("^[0-9]{6}$")] public string Pincode { get; set; } = string.Empty;
    public Guid? ServiceId { get; set; }
    [Required, StringLength(50)] public string PropertyType { get; set; } = string.Empty;
    public DateOnly? PreferredDate { get; set; }
    [StringLength(80)] public string? PreferredTime { get; set; }
    [Required, StringLength(2000)] public string ProblemDescription { get; set; } = string.Empty;
}
