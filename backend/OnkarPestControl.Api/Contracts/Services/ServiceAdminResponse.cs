namespace OnkarPestControl.Api.Contracts.Services;

public class ServiceAdminResponse
{
    public Guid Id { get; set; }
    public string NameEnglish { get; set; } = string.Empty;
    public string NameMarathi { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string DescriptionEnglish { get; set; } = string.Empty;
    public string DescriptionMarathi { get; set; } = string.Empty;
    public decimal? StartingPrice { get; set; }
    public decimal? OfferPrice { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
}
