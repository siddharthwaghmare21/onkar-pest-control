using OnkarPestControl.Api.Domain.Enums;

namespace OnkarPestControl.Api.Domain.Entities;

public class ServiceRequest
{
    public Guid Id { get; set; }
    public Guid? CustomerUserId { get; set; }
    public Guid? ServiceId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public DateOnly? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public string ProblemDescription { get; set; } = string.Empty;
    public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.New;
    public string? AdminNote { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
