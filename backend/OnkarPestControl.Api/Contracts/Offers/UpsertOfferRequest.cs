using System.ComponentModel.DataAnnotations;

namespace OnkarPestControl.Api.Contracts.Offers;

public class UpsertOfferRequest
{
    [Required, StringLength(180)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(1200)] public string Description { get; set; } = string.Empty;
    [Required, StringLength(20)] public string DiscountType { get; set; } = "percentage";
    public decimal DiscountValue { get; set; }
    public DateTime StartsAtUtc { get; set; }
    public DateTime EndsAtUtc { get; set; }
    public bool IsActive { get; set; } = true;
    public bool RegisteredCustomersOnly { get; set; }
}
