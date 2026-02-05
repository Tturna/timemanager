using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back.Migrations
{
    /// <inheritdoc />
    public partial class calendar_event_type_color : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CssColor",
                table: "CalendarEvents");

            migrationBuilder.AddColumn<string>(
                name: "CssColor",
                table: "CalendarEventTypes",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CssColor",
                table: "CalendarEventTypes");

            migrationBuilder.AddColumn<string>(
                name: "CssColor",
                table: "CalendarEvents",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
