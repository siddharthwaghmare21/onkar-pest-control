using System.ComponentModel.DataAnnotations;

namespace OnkarPestControl.Api.Contracts.Services;

public class UpsertServiceRequest
{
    [Required, StringLength(120)] public string NameEnglish { get; set; } = string.Empty;
    [StringLength(120)] public string NameMarathi { get; set; } = string.Empty;
    [Required, StringLength(140)] public string Slug { get; set; } = string.Empty;
    [StringLength(1200)] public string DescriptionEnglish { get; set; } = string.Empty;
    [StringLength(1200)] public string DescriptionMarathi { get; set; } = string.Empty;
    public decimal? StartingPrice { get; set; }
    public decimal? OfferPrice { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}
