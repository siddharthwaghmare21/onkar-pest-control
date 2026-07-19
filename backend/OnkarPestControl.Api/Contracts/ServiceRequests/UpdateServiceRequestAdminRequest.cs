using System.ComponentModel.DataAnnotations;

namespace OnkarPestControl.Api.Contracts.ServiceRequests;

public class UpdateServiceRequestAdminRequest
{
    [StringLength(80)] public string? ServiceName { get; set; }
    [StringLength(40)] public string? LeadSource { get; set; }
    [StringLength(40)] public string? Status { get; set; }
    [StringLength(2000)] public string? AdminNote { get; set; }
    public decimal? ServiceAmount { get; set; }
    public decimal? AdvancePaid { get; set; }
    [StringLength(40)] public string? PaymentStatus { get; set; }
    [StringLength(40)] public string? PaymentMode { get; set; }
    [StringLength(80)] public string? InvoiceNumber { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}
