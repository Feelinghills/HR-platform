namespace InterviewPlatform.Domain.Models;

public enum UserRole
{
    Admin,
    HR,
    DecisionMaker
}

public enum InterviewStatus
{
    Planned,
    Completed,
    Cancelled
}

public enum InterviewDecision
{
    Pending,
    Hired,
    Rejected,
    NextStage,
    TalentPool
}

public enum TemplateType
{
    Offer,
    Rejection,
    Protocol,
    CandidateCard
}

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Login { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }
    public User? DeletedBy { get; set; }
    public string? DeletedReason { get; set; }

    public ICollection<Candidate> CreatedCandidates { get; set; } = new List<Candidate>();
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
    public ICollection<CompetencyMatrix> Evaluations { get; set; } = new List<CompetencyMatrix>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}

public sealed class Vacancy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public Guid? ArchivedById { get; set; }
    public User? ArchivedBy { get; set; }
    public string? ArchivedReason { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }
    public User? DeletedBy { get; set; }
    public string? DeletedReason { get; set; }

    public ICollection<VacancyCompetency> VacancyCompetencies { get; set; } = new List<VacancyCompetency>();
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}

public sealed class Candidate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string City { get; set; } = string.Empty;
    public string DesiredPosition { get; set; } = string.Empty;
    public string Education { get; set; } = string.Empty;
    public string PreviousJob { get; set; } = string.Empty;
    public string Skills { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;
    public Guid? CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public Guid? ArchivedById { get; set; }
    public User? ArchivedBy { get; set; }
    public string? ArchivedReason { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }
    public User? DeletedBy { get; set; }
    public string? DeletedReason { get; set; }

    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}

public sealed class Interview
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VacancyId { get; set; }
    public Vacancy? Vacancy { get; set; }
    public Guid CandidateId { get; set; }
    public Candidate? Candidate { get; set; }
    public Guid InterviewerId { get; set; }
    public User? Interviewer { get; set; }
    public DateTime PlannedDate { get; set; }
    public InterviewStatus Status { get; set; } = InterviewStatus.Planned;
    public InterviewDecision Decision { get; set; } = InterviewDecision.Pending;
    public string? Comments { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }
    public User? DeletedBy { get; set; }
    public string? DeletedReason { get; set; }

    public ICollection<CompetencyMatrix> Matrices { get; set; } = new List<CompetencyMatrix>();
}

public sealed class Competency
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int MaxScore { get; set; } = 5;
    public bool IsActive { get; set; } = true;

    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public Guid? ArchivedById { get; set; }
    public User? ArchivedBy { get; set; }
    public string? ArchivedReason { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedById { get; set; }
    public User? DeletedBy { get; set; }
    public string? DeletedReason { get; set; }

    public ICollection<VacancyCompetency> VacancyCompetencies { get; set; } = new List<VacancyCompetency>();
    public ICollection<CompetencyMatrix> Matrices { get; set; } = new List<CompetencyMatrix>();
}

public sealed class VacancyCompetency
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VacancyId { get; set; }
    public Vacancy? Vacancy { get; set; }
    public Guid CompetencyId { get; set; }
    public Competency? Competency { get; set; }
}

public sealed class CompetencyMatrix
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InterviewId { get; set; }
    public Interview? Interview { get; set; }
    public Guid CompetencyId { get; set; }
    public Competency? Competency { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
    public Guid? EvaluatedById { get; set; }
    public User? EvaluatedBy { get; set; }
    public DateTime? EvaluatedAt { get; set; }
}

public sealed class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EntityId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public Guid? PerformedById { get; set; }
    public User? PerformedBy { get; set; }
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
}

public sealed class OfferTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string HtmlTemplate { get; set; } = string.Empty;
    public TemplateType Type { get; set; }
    public bool IsActive { get; set; } = true;
}
