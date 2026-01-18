using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back.Migrations
{
    /// <inheritdoc />
    public partial class calendar_event_types : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "CalendarEvents");

            migrationBuilder.AddColumn<Guid>(
                name: "EventTypeId",
                table: "CalendarEvents",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "CalendarEventTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarEventTypes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CalendarEvents_EventTypeId",
                table: "CalendarEvents",
                column: "EventTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_CalendarEvents_CalendarEventTypes_EventTypeId",
                table: "CalendarEvents",
                column: "EventTypeId",
                principalTable: "CalendarEventTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CalendarEvents_CalendarEventTypes_EventTypeId",
                table: "CalendarEvents");

            migrationBuilder.DropTable(
                name: "CalendarEventTypes");

            migrationBuilder.DropIndex(
                name: "IX_CalendarEvents_EventTypeId",
                table: "CalendarEvents");

            migrationBuilder.DropColumn(
                name: "EventTypeId",
                table: "CalendarEvents");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "CalendarEvents",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
