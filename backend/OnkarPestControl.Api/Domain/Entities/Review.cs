namespace OnkarPestControl.Api.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid? CustomerUserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string ReviewText { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
