using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteAndExperience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "interviews",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedById",
                table: "interviews",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedReason",
                table: "interviews",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "interviews",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Experience",
                table: "candidates",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_DeletedById",
                table: "interviews",
                column: "DeletedById");

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_users_DeletedById",
                table: "interviews",
                column: "DeletedById",
                principalTable: "users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_interviews_users_DeletedById",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_interviews_DeletedById",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "DeletedById",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "DeletedReason",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "Experience",
                table: "candidates");
        }
    }
}
