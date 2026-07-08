using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "offer_templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    HtmlTemplate = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_offer_templates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Login = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    FullName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedById = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_users_users_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Action = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    PerformedById = table.Column<Guid>(type: "uuid", nullable: true),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_audit_logs_users_PerformedById",
                        column: x => x.PerformedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "candidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    City = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    DesiredPosition = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Education = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    PreviousJob = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Skills = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ArchivedReason = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedById = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_candidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_candidates_users_ArchivedById",
                        column: x => x.ArchivedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_candidates_users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_candidates_users_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "competencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    Category = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    MaxScore = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ArchivedReason = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedById = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_competencies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_competencies_users_ArchivedById",
                        column: x => x.ArchivedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_competencies_users_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "vacancies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    Requirements = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ArchivedReason = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedById = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vacancies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vacancies_users_ArchivedById",
                        column: x => x.ArchivedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_vacancies_users_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "interviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VacancyId = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    InterviewerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlannedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Decision = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Comments = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_interviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_interviews_candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_interviews_users_InterviewerId",
                        column: x => x.InterviewerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_interviews_vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalTable: "vacancies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateTable(
                name: "competency_matrices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InterviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    EvaluatedById = table.Column<Guid>(type: "uuid", nullable: true),
                    EvaluatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_competency_matrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_competency_matrices_competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_competency_matrices_interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_competency_matrices_users_EvaluatedById",
                        column: x => x.EvaluatedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_EntityType_EntityId",
                table: "audit_logs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_PerformedById",
                table: "audit_logs",
                column: "PerformedById");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_ArchivedById",
                table: "candidates",
                column: "ArchivedById");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_CreatedById",
                table: "candidates",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_DeletedById",
                table: "candidates",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_FullName",
                table: "candidates",
                column: "FullName");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_Phone",
                table: "candidates",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_competencies_ArchivedById",
                table: "competencies",
                column: "ArchivedById");

            migrationBuilder.CreateIndex(
                name: "IX_competencies_Category_Name",
                table: "competencies",
                columns: new[] { "Category", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_competencies_DeletedById",
                table: "competencies",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_competency_matrices_CompetencyId",
                table: "competency_matrices",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_competency_matrices_EvaluatedById",
                table: "competency_matrices",
                column: "EvaluatedById");

            migrationBuilder.CreateIndex(
                name: "IX_competency_matrices_InterviewId_CompetencyId",
                table: "competency_matrices",
                columns: new[] { "InterviewId", "CompetencyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_interviews_CandidateId_VacancyId",
                table: "interviews",
                columns: new[] { "CandidateId", "VacancyId" });

            migrationBuilder.CreateIndex(
                name: "IX_interviews_InterviewerId",
                table: "interviews",
                column: "InterviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_PlannedDate",
                table: "interviews",
                column: "PlannedDate");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_VacancyId",
                table: "interviews",
                column: "VacancyId");

            migrationBuilder.CreateIndex(
                name: "IX_users_DeletedById",
                table: "users",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Login",
                table: "users",
                column: "Login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_ArchivedById",
                table: "vacancies",
                column: "ArchivedById");

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_DeletedById",
                table: "vacancies",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_Title",
                table: "vacancies",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_vacancy_competencies_CompetencyId",
                table: "vacancy_competencies",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_vacancy_competencies_VacancyId_CompetencyId",
                table: "vacancy_competencies",
                columns: new[] { "VacancyId", "CompetencyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "competency_matrices");

            migrationBuilder.DropTable(
                name: "offer_templates");

            migrationBuilder.DropTable(
                name: "vacancy_competencies");

            migrationBuilder.DropTable(
                name: "interviews");

            migrationBuilder.DropTable(
                name: "competencies");

            migrationBuilder.DropTable(
                name: "candidates");

            migrationBuilder.DropTable(
                name: "vacancies");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
