using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PoolFinance.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    VisitsLeft = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Duration = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    VisitsLimit = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClientId = table.Column<int>(type: "integer", nullable: true),
                    ClientName = table.Column<string>(type: "text", nullable: false),
                    ServiceId = table.Column<int>(type: "integer", nullable: true),
                    ServiceItem = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Transactions_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Clients",
                columns: new[] { "Id", "Category", "CreatedAt", "Email", "FullName", "Phone", "VisitsLeft" },
                values: new object[,]
                {
                    { 1, "Students PGU", new DateTime(2026, 10, 15, 10, 0, 0, 0, DateTimeKind.Utc), null, "Ivan Ivanov", null, 8 },
                    { 2, "External", new DateTime(2026, 10, 15, 10, 0, 0, 0, DateTimeKind.Utc), null, "Alex Petrov", null, 1 }
                });

            migrationBuilder.InsertData(
                table: "Services",
                columns: new[] { "Id", "Description", "Duration", "Price", "Title", "VisitsLimit" },
                values: new object[,]
                {
                    { 1, "Разовое посещение", "45 min", 7.50m, "Single Entry", 1 },
                    { 2, "Абонемент на 8 посещений", "1 month", 45.00m, "8 Visits Subscr.", 8 },
                    { 3, "Групповое занятие", "60 min", 12.00m, "AquaAerobics", 1 },
                    { 4, "Аренда дорожки", "60 min", 35.00m, "Pool Lane Hire", 1 }
                });

            migrationBuilder.InsertData(
                table: "Transactions",
                columns: new[] { "Id", "Amount", "ClientId", "ClientName", "CreatedAt", "PaymentMethod", "ServiceId", "ServiceItem", "Status" },
                values: new object[,]
                {
                    { 20128, 7.50m, 2, "Alex Petrov", new DateTime(2026, 10, 15, 9, 45, 0, 0, DateTimeKind.Utc), "Cash", null, "Single Entry", "Completed" },
                    { 20134, 7.50m, 1, "Ivan Ivanov", new DateTime(2026, 10, 14, 7, 30, 0, 0, DateTimeKind.Utc), "Card", null, "8 Visits Subscr.", "Completed" },
                    { 20135, 45.00m, 2, "Alex Petrov", new DateTime(2026, 10, 15, 9, 45, 0, 0, DateTimeKind.Utc), "Cash", null, "8 Visits Entry", "Completed" },
                    { 20137, 7.50m, 2, "Alex Petrov", new DateTime(2026, 10, 15, 9, 45, 0, 0, DateTimeKind.Utc), "Cash", null, "Single Entry", "Completed" },
                    { 20139, 45.00m, 1, "Ivan Ivanov", new DateTime(2026, 10, 14, 11, 30, 0, 0, DateTimeKind.Utc), "Card", null, "8 Visits Subscr.", "Completed" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ClientId",
                table: "Transactions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ServiceId",
                table: "Transactions",
                column: "ServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Services");
        }
    }
}
