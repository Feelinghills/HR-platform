using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVacancyCompetencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vacancy_competencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VacancyId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vacancy_competencies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vacancy_competencies_competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vacancy_competencies_vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalTable: "vacancies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_vacancy_competencies_VacancyId_CompetencyId",
                table: "vacancy_competencies",
                columns: new[] { "VacancyId", "CompetencyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vacancy_competencies_CompetencyId",
                table: "vacancy_competencies",
                column: "CompetencyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "vacancy_competencies");
        }
    }
}
