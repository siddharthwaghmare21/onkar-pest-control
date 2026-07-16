namespace OnkarPestControl.Api.Domain.Entities;

public class Service
{
    public Guid Id { get; set; }
    public string NameEnglish { get; set; } = string.Empty;
    public string NameMarathi { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string DescriptionEnglish { get; set; } = string.Empty;
    public string DescriptionMarathi { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
