using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Domain.Entities;

namespace OnkarPestControl.Api.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<GalleryItem> GalleryItems => Set<GalleryItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<Service>().HasIndex(service => service.Slug).IsUnique();
        modelBuilder.Entity<ServiceRequest>().HasIndex(request => request.Status);
        modelBuilder.Entity<Offer>().HasIndex(offer => new { offer.IsActive, offer.StartsAtUtc, offer.EndsAtUtc });
        modelBuilder.Entity<Review>().HasIndex(review => review.IsApproved);
        modelBuilder.Entity<GalleryItem>().HasIndex(item => new { item.IsActive, item.DisplayOrder });
    }
}
