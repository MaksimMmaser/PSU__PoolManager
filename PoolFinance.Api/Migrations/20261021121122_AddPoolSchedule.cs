using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PoolFinance.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPoolSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PoolSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LaneNumber = table.Column<int>(type: "integer", nullable: false),
                    DayOfWeek = table.Column<string>(type: "text", nullable: false),
                    TimeSlot = table.Column<string>(type: "text", nullable: false),
                    Activity = table.Column<string>(type: "text", nullable: false),
                    Occupancy = table.Column<int>(type: "integer", nullable: false),
                    MaxCapacity = table.Column<int>(type: "integer", nullable: false),
                    Trainer = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PoolSessions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "PoolSessions",
                columns: new[] { "Id", "Activity", "DayOfWeek", "LaneNumber", "MaxCapacity", "Occupancy", "TimeSlot", "Trainer" },
                values: new object[,]
                {
                    { 1, "FreeSwim", "Monday", 1, 8, 4, "08:00 - 09:00", null },
                    { 2, "FreeSwim", "Monday", 1, 8, 6, "09:00 - 10:00", null },
                    { 3, "AquaAerobics", "Monday", 1, 12, 12, "10:00 - 11:00", "Елена Смирнова" },
                    { 4, "SportsClub", "Monday", 1, 8, 8, "17:00 - 18:00", "Дмитрий Волков" },
                    { 5, "FreeSwim", "Monday", 2, 8, 3, "08:00 - 09:00", null },
                    { 6, "FreeSwim", "Monday", 2, 8, 5, "09:00 - 10:00", null },
                    { 7, "FreeSwim", "Monday", 2, 8, 7, "10:00 - 11:00", null },
                    { 8, "PrivateHire", "Monday", 2, 1, 1, "11:00 - 12:00", "Аренда: ООО Газ" },
                    { 9, "SportsClub", "Monday", 2, 8, 8, "17:00 - 18:00", "Дмитрий Волков" },
                    { 10, "FreeSwim", "Monday", 3, 8, 2, "08:00 - 09:00", null },
                    { 11, "FreeSwim", "Monday", 3, 8, 4, "10:00 - 11:00", null },
                    { 12, "FreeSwim", "Monday", 3, 8, 5, "11:00 - 12:00", null },
                    { 13, "FreeSwim", "Monday", 3, 8, 6, "17:00 - 18:00", null },
                    { 14, "FreeSwim", "Monday", 4, 8, 4, "09:00 - 10:00", null },
                    { 15, "PrivateHire", "Monday", 4, 1, 1, "10:00 - 11:00", null },
                    { 16, "AquaAerobics", "Monday", 4, 12, 10, "17:00 - 18:00", "Елена Смирнова" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PoolSessions");
        }
    }
}
