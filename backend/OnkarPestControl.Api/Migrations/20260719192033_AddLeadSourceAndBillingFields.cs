using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnkarPestControl.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadSourceAndBillingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AdvancePaid",
                table: "ServiceRequests",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAtUtc",
                table: "ServiceRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNumber",
                table: "ServiceRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeadSource",
                table: "ServiceRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentMode",
                table: "ServiceRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "ServiceRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "ServiceAmount",
                table: "ServiceRequests",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceName",
                table: "ServiceRequests",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_LeadSource",
                table: "ServiceRequests",
                column: "LeadSource");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_PaymentStatus",
                table: "ServiceRequests",
                column: "PaymentStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_LeadSource",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_PaymentStatus",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "AdvancePaid",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "CompletedAtUtc",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "InvoiceNumber",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "LeadSource",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "PaymentMode",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ServiceAmount",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "ServiceName",
                table: "ServiceRequests");
        }
    }
}
