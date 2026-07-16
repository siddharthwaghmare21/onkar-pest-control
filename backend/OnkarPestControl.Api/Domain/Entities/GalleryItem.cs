namespace OnkarPestControl.Api.Domain.Entities;

public class GalleryItem
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string CaptionEnglish { get; set; } = string.Empty;
    public string CaptionMarathi { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
