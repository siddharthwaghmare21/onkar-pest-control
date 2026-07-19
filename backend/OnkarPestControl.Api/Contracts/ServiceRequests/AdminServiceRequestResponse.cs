namespace OnkarPestControl.Api.Contracts.ServiceRequests;

public class AdminServiceRequestResponse
{
    public Guid Id { get; set; }
    public Guid? CustomerUserId { get; set; }
    public string? ServiceName { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string LeadSource { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public DateOnly? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public string ProblemDescription { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public decimal? ServiceAmount { get; set; }
    public decimal? AdvancePaid { get; set; }
    public decimal? BalanceAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMode { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
