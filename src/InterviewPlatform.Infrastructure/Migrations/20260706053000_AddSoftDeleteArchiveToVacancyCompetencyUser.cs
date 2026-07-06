using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteArchiveToVacancyCompetencyUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Vacancy — archive fields
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "vacancies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime?>(
                name: "ArchivedAt",
                table: "vacancies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid?>(
                name: "ArchivedById",
                table: "vacancies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ArchivedReason",
                table: "vacancies",
                type: "text",
                nullable: true);

            // Vacancy — soft delete fields
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "vacancies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime?>(
                name: "DeletedAt",
                table: "vacancies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid?>(
                name: "DeletedById",
                table: "vacancies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedReason",
                table: "vacancies",
                type: "text",
                nullable: true);

            // Competency — archive fields
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "competencies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime?>(
                name: "ArchivedAt",
                table: "competencies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid?>(
                name: "ArchivedById",
                table: "competencies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ArchivedReason",
                table: "competencies",
                type: "text",
                nullable: true);

            // Competency — soft delete fields
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "competencies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime?>(
                name: "DeletedAt",
                table: "competencies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid?>(
                name: "DeletedById",
                table: "competencies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedReason",
                table: "competencies",
                type: "text",
                nullable: true);

            // User — soft delete fields
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime?>(
                name: "DeletedAt",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid?>(
                name: "DeletedById",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedReason",
                table: "users",
                type: "text",
                nullable: true);

            // FK constraints for Vacancy
            migrationBuilder.AddForeignKey(
                name: "FK_vacancies_users_ArchivedById",
                table: "vacancies",
                column: "ArchivedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_vacancies_users_DeletedById",
                table: "vacancies",
                column: "DeletedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // FK constraints for Competency
            migrationBuilder.AddForeignKey(
                name: "FK_competencies_users_ArchivedById",
                table: "competencies",
                column: "ArchivedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_competencies_users_DeletedById",
                table: "competencies",
                column: "DeletedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // FK constraint for User (self-referencing)
            migrationBuilder.AddForeignKey(
                name: "FK_users_users_DeletedById",
                table: "users",
                column: "DeletedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_vacancies_users_ArchivedById", table: "vacancies");
            migrationBuilder.DropForeignKey(name: "FK_vacancies_users_DeletedById", table: "vacancies");
            migrationBuilder.DropForeignKey(name: "FK_competencies_users_ArchivedById", table: "competencies");
            migrationBuilder.DropForeignKey(name: "FK_competencies_users_DeletedById", table: "competencies");
            migrationBuilder.DropForeignKey(name: "FK_users_users_DeletedById", table: "users");

            migrationBuilder.DropColumn(name: "IsArchived", table: "vacancies");
            migrationBuilder.DropColumn(name: "ArchivedAt", table: "vacancies");
            migrationBuilder.DropColumn(name: "ArchivedById", table: "vacancies");
            migrationBuilder.DropColumn(name: "ArchivedReason", table: "vacancies");
            migrationBuilder.DropColumn(name: "IsDeleted", table: "vacancies");
            migrationBuilder.DropColumn(name: "DeletedAt", table: "vacancies");
            migrationBuilder.DropColumn(name: "DeletedById", table: "vacancies");
            migrationBuilder.DropColumn(name: "DeletedReason", table: "vacancies");

            migrationBuilder.DropColumn(name: "IsArchived", table: "competencies");
            migrationBuilder.DropColumn(name: "ArchivedAt", table: "competencies");
            migrationBuilder.DropColumn(name: "ArchivedById", table: "competencies");
            migrationBuilder.DropColumn(name: "ArchivedReason", table: "competencies");
            migrationBuilder.DropColumn(name: "IsDeleted", table: "competencies");
            migrationBuilder.DropColumn(name: "DeletedAt", table: "competencies");
            migrationBuilder.DropColumn(name: "DeletedById", table: "competencies");
            migrationBuilder.DropColumn(name: "DeletedReason", table: "competencies");

            migrationBuilder.DropColumn(name: "IsDeleted", table: "users");
            migrationBuilder.DropColumn(name: "DeletedAt", table: "users");
            migrationBuilder.DropColumn(name: "DeletedById", table: "users");
            migrationBuilder.DropColumn(name: "DeletedReason", table: "users");
        }
    }
}
