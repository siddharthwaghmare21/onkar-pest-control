using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OnkarPestControl.Api.Persistence;

#nullable disable

namespace OnkarPestControl.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260720123000_AddServicePricingFields")]
    public partial class AddServicePricingFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "OfferPrice",
                table: "Services",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "StartingPrice",
                table: "Services",
                type: "numeric",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OfferPrice",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "StartingPrice",
                table: "Services");
        }
    }
}
