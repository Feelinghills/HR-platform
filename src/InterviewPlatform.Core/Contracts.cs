using InterviewPlatform.Domain.Models;

namespace InterviewPlatform.Core;

public sealed record LoginRequest(string Email, string Password);

public sealed record RegisterUserRequest(string Email, string Password, string FullName, UserRole Role);

public sealed record AuthResponse(string Token, UserDto User);

public sealed record UserDto(Guid Id, string Email, string FullName, UserRole Role, bool IsActive, DateTime CreatedAt);

public sealed record UpdateUserStatusRequest(bool IsActive);

public sealed record CandidateDto(
    Guid Id,
    string FullName,
    string Phone,
    string? Email,
    string City,
    string DesiredPosition,
    string Education,
    string PreviousJob,
    string Skills,
    bool IsArchived,
    Guid? CreatedById,
    DateTime CreatedAt);

public sealed record CreateCandidateRequest(
    string FullName,
    string Phone,
    string? Email,
    string City,
    string DesiredPosition,
    string Education,
    string PreviousJob,
    string Skills);

public sealed record UpdateCandidateRequest(
    string FullName,
    string Phone,
    string? Email,
    string City,
    string DesiredPosition,
    string Education,
    string PreviousJob,
    string Skills,
    bool IsArchived);

public sealed record VacancyDto(Guid Id, string Title, string Description, string Requirements, bool IsActive, DateTime CreatedAt, IReadOnlyList<Guid> CompetencyIds, bool IsArchived, bool IsDeleted);

public sealed record CreateVacancyRequest(string Title, string Description, string Requirements, bool IsActive = true, IReadOnlyList<Guid>? CompetencyIds = null);

public sealed record UpdateVacancyRequest(string Title, string Description, string Requirements, bool IsActive, IReadOnlyList<Guid>? CompetencyIds = null);

public sealed record CompetencyDto(Guid Id, string Name, string Description, string Category, int MaxScore, bool IsActive, bool IsArchived, bool IsDeleted);

public sealed record CreateCompetencyRequest(string Name, string Description, string Category, int MaxScore = 5, bool IsActive = true);

public sealed record UpdateCompetencyRequest(string Name, string Description, string Category, int MaxScore, bool IsActive);

public sealed record MatrixItemDto(
    Guid Id,
    Guid CompetencyId,
    string CompetencyName,
    string CompetencyCategory,
    int MaxScore,
    int Score,
    string? Comment,
    Guid? EvaluatedById,
    DateTime? EvaluatedAt);

public sealed record MatrixScoreRequest(Guid CompetencyId, int Score, string? Comment);

public sealed record UpsertMatrixRequest(IReadOnlyCollection<MatrixScoreRequest> Items);

public sealed record InterviewDto(
    Guid Id,
    Guid CandidateId,
    string CandidateName,
    Guid VacancyId,
    string VacancyTitle,
    Guid InterviewerId,
    string InterviewerName,
    DateTime PlannedDate,
    InterviewStatus Status,
    InterviewDecision Decision,
    string? Comments,
    DateTime CreatedAt,
    IReadOnlyList<MatrixItemDto> Matrix);

public sealed record CreateInterviewRequest(
    Guid CandidateId,
    Guid VacancyId,
    Guid InterviewerId,
    DateTime PlannedDate,
    string? Comments);

public sealed record UpdateInterviewStatusRequest(InterviewStatus Status, string? Comments);

public sealed record DecideInterviewRequest(InterviewDecision Decision, string? Comments);

public sealed record DeleteRequest(string? Reason);

public sealed record ReportSection(string Title, IReadOnlyList<string> Lines);

public sealed record ReportDocument(string Title, string Subtitle, IReadOnlyList<ReportSection> Sections);

public sealed record GeneratedReport(string FileName, byte[] Content);

public interface IRepository<T> where T : class
{
    IQueryable<T> Query();
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void Remove(T entity);
}

public interface IUnitOfWork
{
    IRepository<User> Users { get; }
    IRepository<Candidate> Candidates { get; }
    IRepository<Vacancy> Vacancies { get; }
    IRepository<Interview> Interviews { get; }
    IRepository<Competency> Competencies { get; }
    IRepository<CompetencyMatrix> CompetencyMatrices { get; }
    IRepository<VacancyCompetency> VacancyCompetencies { get; }
    IRepository<AuditLog> AuditLogs { get; }
    IRepository<OfferTemplate> OfferTemplates { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}

public interface IJwtTokenService
{
    string Generate(User user);
}

public interface IAuditService
{
    Task LogAsync(
        string entityType,
        Guid entityId,
        string action,
        object? oldValues,
        object? newValues,
        Guid? performedById,
        CancellationToken cancellationToken = default);
}

public sealed record AuditLogDto(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string Action,
    string? OldValues,
    string? NewValues,
    Guid? PerformedById,
    string? PerformedByName,
    DateTime PerformedAt);

public interface IPdfService
{
    Task<byte[]> GenerateAsync(ReportDocument document, CancellationToken cancellationToken = default);
}

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> CreateUserAsync(RegisterUserRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserDto>> ListUsersAsync(CancellationToken cancellationToken = default);
    Task<UserDto> SetUserStatusAsync(Guid id, bool isActive, Guid? performedById, CancellationToken cancellationToken = default);
    Task DeleteUserAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default);
    Task RestoreUserAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
}

public interface ICandidateService
{
    Task<IReadOnlyList<CandidateDto>> ListAsync(string? search, bool includeArchived, CancellationToken cancellationToken = default);
    Task<CandidateDto> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CandidateDto> CreateAsync(CreateCandidateRequest request, Guid? createdById, CancellationToken cancellationToken = default);
    Task<CandidateDto> UpdateAsync(Guid id, UpdateCandidateRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task ArchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
    Task UnarchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default);
    Task RestoreAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
}

public interface IVacancyService
{
    Task<IReadOnlyList<VacancyDto>> ListAsync(bool activeOnly, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<VacancyDto> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VacancyDto> CreateAsync(CreateVacancyRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task<VacancyDto> UpdateAsync(Guid id, UpdateVacancyRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task ArchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
    Task UnarchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default);
    Task RestoreAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
}

public interface ICompetencyService
{
    Task<IReadOnlyList<CompetencyDto>> ListAsync(bool activeOnly, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<CompetencyDto> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CompetencyDto> CreateAsync(CreateCompetencyRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task<CompetencyDto> UpdateAsync(Guid id, UpdateCompetencyRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task ArchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
    Task UnarchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default);
    Task RestoreAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default);
}

public interface IInterviewService
{
    Task<IReadOnlyList<InterviewDto>> ListAsync(
        Guid? candidateId,
        Guid? vacancyId,
        InterviewStatus? status,
        string? search,
        CancellationToken cancellationToken = default);

    Task<InterviewDto> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InterviewDto> CreateAsync(CreateInterviewRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task<InterviewDto> UpdateStatusAsync(Guid id, UpdateInterviewStatusRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task<InterviewDto> DecideAsync(Guid id, DecideInterviewRequest request, Guid? performedById, CancellationToken cancellationToken = default);
    Task<InterviewDto> UpsertMatrixAsync(Guid id, UpsertMatrixRequest request, Guid? evaluatedById, CancellationToken cancellationToken = default);
}

public interface IReportService
{
    Task<GeneratedReport> GenerateCandidateCardAsync(Guid candidateId, CancellationToken cancellationToken = default);
    Task<GeneratedReport> GenerateInterviewProtocolAsync(Guid interviewId, CancellationToken cancellationToken = default);
    Task<GeneratedReport> GenerateDecisionLetterAsync(Guid interviewId, CancellationToken cancellationToken = default);
}

public sealed class NotFoundException(string message) : Exception(message);

public sealed class BusinessException(string message) : Exception(message);
