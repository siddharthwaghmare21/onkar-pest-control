namespace OnkarPestControl.Api.Contracts.ServiceRequests;

public class ServiceRequestSummaryResponse
{
    public Guid Id { get; set; }
    public string? ServiceName { get; set; }
    public string LeadSource { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public DateOnly? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public string ProblemDescription { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
