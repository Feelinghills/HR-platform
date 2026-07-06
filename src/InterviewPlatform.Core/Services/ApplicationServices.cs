using System.Text.Json;
using InterviewPlatform.Domain.Models;

namespace InterviewPlatform.Core.Services;

public sealed class AuditService(IUnitOfWork unitOfWork) : IAuditService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task LogAsync(
        string entityType,
        Guid entityId,
        string action,
        object? oldValues,
        object? newValues,
        Guid? performedById,
        CancellationToken cancellationToken = default)
    {
        await unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            OldValues = oldValues is null ? null : JsonSerializer.Serialize(oldValues, JsonOptions),
            NewValues = newValues is null ? null : JsonSerializer.Serialize(newValues, JsonOptions),
            PerformedById = performedById,
            PerformedAt = DateTime.UtcNow
        }, cancellationToken);
    }
}

public sealed class AuthService(
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IAuditService auditService) : IAuthService
{
    public Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = unitOfWork.Users.Query().FirstOrDefault(x => x.Email.ToLower() == email && x.IsActive);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new BusinessException("Неверный email или пароль.");
        }

        return Task.FromResult(new AuthResponse(jwtTokenService.Generate(user), Map(user)));
    }

    public async Task<UserDto> CreateUserAsync(RegisterUserRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);

        if (unitOfWork.Users.Query().Any(x => x.Email.ToLower() == email))
        {
            throw new BusinessException("Пользователь с таким email уже существует.");
        }

        var user = new User
        {
            Email = email,
            FullName = request.FullName.Trim(),
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = request.Role
        };

        await unitOfWork.Users.AddAsync(user, cancellationToken);
        await auditService.LogAsync("User", user.Id, "Create", null, new { user.Email, user.FullName, user.Role }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(user);
    }

    public Task<IReadOnlyList<UserDto>> ListUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = unitOfWork.Users.Query()
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.FullName)
            .Select(x => Map(x))
            .ToList();

        return Task.FromResult<IReadOnlyList<UserDto>>(users);
    }

    public async Task<UserDto> SetUserStatusAsync(Guid id, bool isActive, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Пользователь не найден.");

        var oldValues = new { user.IsActive };
        user.IsActive = isActive;

        unitOfWork.Users.Update(user);
        await auditService.LogAsync("User", id, "SetStatus", oldValues, new { user.IsActive }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(user);
    }

    public async Task DeleteUserAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Пользователь не найден.");
        if (user.IsDeleted) throw new BusinessException("Пользователь уже удалён.");
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.DeletedById = performedById;
        user.DeletedReason = reason;
        unitOfWork.Users.Update(user);
        await auditService.LogAsync("User", id, "SoftDelete", null, new { user.IsDeleted, reason }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreUserAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Пользователь не найден.");
        if (!user.IsDeleted) throw new BusinessException("Пользователь не удалён.");
        user.IsDeleted = false;
        user.DeletedAt = null;
        user.DeletedById = null;
        user.DeletedReason = null;
        unitOfWork.Users.Update(user);
        await auditService.LogAsync("User", id, "Restore", null, new { user.IsDeleted }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static UserDto Map(User user) => new(
        user.Id,
        user.Email,
        user.FullName,
        user.Role,
        user.IsActive,
        user.CreatedAt);
}

public sealed class CandidateService(IUnitOfWork unitOfWork, IAuditService auditService) : ICandidateService
{
    public Task<IReadOnlyList<CandidateDto>> ListAsync(string? search, bool includeArchived, CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.Candidates.Query().Where(x => !x.IsDeleted);

        if (!includeArchived)
        {
            query = query.Where(x => !x.IsArchived);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.FullName.ToLower().Contains(term)
                || x.Phone.ToLower().Contains(term)
                || (x.Email != null && x.Email.ToLower().Contains(term))
                || x.City.ToLower().Contains(term)
                || x.DesiredPosition.ToLower().Contains(term));
        }

        var candidates = query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => Map(x))
            .ToList();

        return Task.FromResult<IReadOnlyList<CandidateDto>>(candidates);
    }

    public Task<CandidateDto> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var candidate = unitOfWork.Candidates.Query()
            .Where(x => x.Id == id)
            .Select(x => Map(x))
            .FirstOrDefault()
            ?? throw new NotFoundException("Кандидат не найден.");

        return Task.FromResult(candidate);
    }

    public async Task<CandidateDto> CreateAsync(CreateCandidateRequest request, Guid? createdById, CancellationToken cancellationToken = default)
    {
        var candidate = new Candidate
        {
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant(),
            City = request.City.Trim(),
            DesiredPosition = request.DesiredPosition.Trim(),
            Education = request.Education.Trim(),
            PreviousJob = request.PreviousJob.Trim(),
            Skills = request.Skills.Trim(),
            CreatedById = createdById
        };

        await unitOfWork.Candidates.AddAsync(candidate, cancellationToken);
        await auditService.LogAsync("Candidate", candidate.Id, "Create", null, Map(candidate), createdById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(candidate);
    }

    public async Task<CandidateDto> UpdateAsync(Guid id, UpdateCandidateRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var candidate = await unitOfWork.Candidates.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Кандидат не найден.");

        var oldValues = Map(candidate);

        candidate.FullName = request.FullName.Trim();
        candidate.Phone = request.Phone.Trim();
        candidate.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        candidate.City = request.City.Trim();
        candidate.DesiredPosition = request.DesiredPosition.Trim();
        candidate.Education = request.Education.Trim();
        candidate.PreviousJob = request.PreviousJob.Trim();
        candidate.Skills = request.Skills.Trim();
        candidate.IsArchived = request.IsArchived;

        unitOfWork.Candidates.Update(candidate);
        await auditService.LogAsync("Candidate", id, "Update", oldValues, Map(candidate), performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(candidate);
    }

    public async Task ArchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var candidate = await unitOfWork.Candidates.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Кандидат не найден.");
        if (candidate.IsArchived) throw new BusinessException("Кандидат уже в архиве.");

        candidate.IsArchived = true;
        candidate.ArchivedAt = DateTime.UtcNow;
        candidate.ArchivedById = performedById;
        unitOfWork.Candidates.Update(candidate);
        await auditService.LogAsync("Candidate", id, "Archive", null, new { candidate.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task UnarchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var candidate = await unitOfWork.Candidates.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Кандидат не найден.");
        if (!candidate.IsArchived) throw new BusinessException("Кандидат не в архиве.");

        candidate.IsArchived = false;
        candidate.ArchivedAt = null;
        candidate.ArchivedById = null;
        candidate.ArchivedReason = null;
        unitOfWork.Candidates.Update(candidate);
        await auditService.LogAsync("Candidate", id, "Unarchive", null, new { candidate.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default)
    {
        var candidate = await unitOfWork.Candidates.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Кандидат не найден.");
        if (candidate.IsDeleted) throw new BusinessException("Кандидат уже удалён.");

        candidate.IsDeleted = true;
        candidate.DeletedAt = DateTime.UtcNow;
        candidate.DeletedById = performedById;
        candidate.DeletedReason = reason;
        unitOfWork.Candidates.Update(candidate);
        await auditService.LogAsync("Candidate", id, "SoftDelete", null, new { candidate.IsDeleted, reason }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var candidate = await unitOfWork.Candidates.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Кандидат не найден.");
        if (!candidate.IsDeleted && !candidate.IsArchived) throw new BusinessException("Кандидат не удалён и не в архиве.");

        if (candidate.IsDeleted)
        {
            candidate.IsDeleted = false;
            candidate.DeletedAt = null;
            candidate.DeletedById = null;
            candidate.DeletedReason = null;
        }
        if (candidate.IsArchived)
        {
            candidate.IsArchived = false;
            candidate.ArchivedAt = null;
            candidate.ArchivedById = null;
            candidate.ArchivedReason = null;
        }
        unitOfWork.Candidates.Update(candidate);
        await auditService.LogAsync("Candidate", id, "Restore", null, new { candidate.IsDeleted, candidate.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static CandidateDto Map(Candidate candidate) => new(
        candidate.Id,
        candidate.FullName,
        candidate.Phone,
        candidate.Email,
        candidate.City,
        candidate.DesiredPosition,
        candidate.Education,
        candidate.PreviousJob,
        candidate.Skills,
        candidate.IsArchived,
        candidate.CreatedById,
        candidate.CreatedAt);
}

public sealed class VacancyService(IUnitOfWork unitOfWork, IAuditService auditService) : IVacancyService
{
    public Task<IReadOnlyList<VacancyDto>> ListAsync(bool activeOnly, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.Vacancies.Query().Where(x => !x.IsDeleted);

        if (!includeArchived)
        {
            query = query.Where(x => !x.IsArchived);
        }

        if (activeOnly)
        {
            query = query.Where(x => x.IsActive);
        }

        var vacancyList = query.OrderBy(x => x.Title).ToList();
        var allLinks = unitOfWork.VacancyCompetencies.Query().ToList();
        var vacancies = vacancyList.Select(x => Map(x, allLinks)).ToList();

        return Task.FromResult<IReadOnlyList<VacancyDto>>(vacancies);
    }

    public Task<VacancyDto> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vacancy = unitOfWork.Vacancies.Query()
            .Where(x => x.Id == id)
            .FirstOrDefault()
            ?? throw new NotFoundException("Вакансия не найдена.");

        var links = unitOfWork.VacancyCompetencies.Query()
            .Where(x => x.VacancyId == id)
            .ToList();

        return Task.FromResult(Map(vacancy, links));
    }

    public async Task<VacancyDto> CreateAsync(CreateVacancyRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var vacancy = new Vacancy
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Requirements = request.Requirements.Trim(),
            IsActive = request.IsActive
        };

        await unitOfWork.Vacancies.AddAsync(vacancy, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        if (request.CompetencyIds is { Count: > 0 })
        {
            foreach (var competencyId in request.CompetencyIds.Distinct())
            {
                var competencyExists = unitOfWork.Competencies.Query().Any(x => x.Id == competencyId && x.IsActive);
                if (!competencyExists)
                {
                    throw new NotFoundException($"Компетенция {competencyId} не найдена или неактивна.");
                }

                await unitOfWork.VacancyCompetencies.AddAsync(new VacancyCompetency
                {
                    VacancyId = vacancy.Id,
                    CompetencyId = competencyId
                }, cancellationToken);
            }
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        await auditService.LogAsync("Vacancy", vacancy.Id, "Create", null, Map(vacancy), performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetAsync(vacancy.Id, cancellationToken);
    }

    public async Task<VacancyDto> UpdateAsync(Guid id, UpdateVacancyRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var vacancy = await unitOfWork.Vacancies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Вакансия не найдена.");

        var oldValues = Map(vacancy);

        vacancy.Title = request.Title.Trim();
        vacancy.Description = request.Description.Trim();
        vacancy.Requirements = request.Requirements.Trim();
        vacancy.IsActive = request.IsActive;

        unitOfWork.Vacancies.Update(vacancy);

        var existingLinks = unitOfWork.VacancyCompetencies.Query()
            .Where(x => x.VacancyId == id)
            .ToList();

        var newIds = (request.CompetencyIds ?? Array.Empty<Guid>()).Distinct().ToList();

        foreach (var link in existingLinks.Where(x => !newIds.Contains(x.CompetencyId)))
        {
            unitOfWork.VacancyCompetencies.Remove(link);
        }

        foreach (var competencyId in newIds.Where(nid => !existingLinks.Any(x => x.CompetencyId == nid)))
        {
            var competencyExists = unitOfWork.Competencies.Query().Any(x => x.Id == competencyId && x.IsActive);
            if (!competencyExists)
            {
                throw new NotFoundException($"Компетенция {competencyId} не найдена или неактивна.");
            }

            await unitOfWork.VacancyCompetencies.AddAsync(new VacancyCompetency
            {
                VacancyId = id,
                CompetencyId = competencyId
            }, cancellationToken);
        }

        await auditService.LogAsync("Vacancy", id, "Update", oldValues, Map(vacancy), performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task ArchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var vacancy = await unitOfWork.Vacancies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Вакансия не найдена.");
        if (vacancy.IsArchived) throw new BusinessException("Вакансия уже в архиве.");
        vacancy.IsArchived = true;
        vacancy.ArchivedAt = DateTime.UtcNow;
        vacancy.ArchivedById = performedById;
        unitOfWork.Vacancies.Update(vacancy);
        await auditService.LogAsync("Vacancy", id, "Archive", null, new { vacancy.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task UnarchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var vacancy = await unitOfWork.Vacancies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Вакансия не найдена.");
        if (!vacancy.IsArchived) throw new BusinessException("Вакансия не в архиве.");
        vacancy.IsArchived = false;
        vacancy.ArchivedAt = null;
        vacancy.ArchivedById = null;
        vacancy.ArchivedReason = null;
        unitOfWork.Vacancies.Update(vacancy);
        await auditService.LogAsync("Vacancy", id, "Unarchive", null, new { vacancy.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default)
    {
        var vacancy = await unitOfWork.Vacancies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Вакансия не найдена.");
        if (vacancy.IsDeleted) throw new BusinessException("Вакансия уже удалена.");
        vacancy.IsDeleted = true;
        vacancy.DeletedAt = DateTime.UtcNow;
        vacancy.DeletedById = performedById;
        vacancy.DeletedReason = reason;
        unitOfWork.Vacancies.Update(vacancy);
        await auditService.LogAsync("Vacancy", id, "SoftDelete", null, new { vacancy.IsDeleted, reason }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var vacancy = await unitOfWork.Vacancies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Вакансия не найдена.");
        if (!vacancy.IsDeleted && !vacancy.IsArchived) throw new BusinessException("Вакансия не удалена и не в архиве.");
        if (vacancy.IsDeleted)
        {
            vacancy.IsDeleted = false;
            vacancy.DeletedAt = null;
            vacancy.DeletedById = null;
            vacancy.DeletedReason = null;
        }
        if (vacancy.IsArchived)
        {
            vacancy.IsArchived = false;
            vacancy.ArchivedAt = null;
            vacancy.ArchivedById = null;
            vacancy.ArchivedReason = null;
        }
        unitOfWork.Vacancies.Update(vacancy);
        await auditService.LogAsync("Vacancy", id, "Restore", null, new { vacancy.IsDeleted, vacancy.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static VacancyDto Map(Vacancy vacancy, List<VacancyCompetency>? links = null)
    {
        var competencyIds = links?.Where(vc => vc.VacancyId == vacancy.Id).Select(vc => vc.CompetencyId).ToList()
            ?? new List<Guid>();
        return new VacancyDto(
            vacancy.Id,
            vacancy.Title,
            vacancy.Description,
            vacancy.Requirements,
            vacancy.IsActive,
            vacancy.CreatedAt,
            competencyIds,
            vacancy.IsArchived,
            vacancy.IsDeleted);
    }
}

public sealed class CompetencyService(IUnitOfWork unitOfWork, IAuditService auditService) : ICompetencyService
{
    public Task<IReadOnlyList<CompetencyDto>> ListAsync(bool activeOnly, bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.Competencies.Query().Where(x => !x.IsDeleted);

        if (!includeArchived)
        {
            query = query.Where(x => !x.IsArchived);
        }

        if (activeOnly)
        {
            query = query.Where(x => x.IsActive);
        }

        var competencies = query
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .Select(x => Map(x))
            .ToList();

        return Task.FromResult<IReadOnlyList<CompetencyDto>>(competencies);
    }

    public Task<CompetencyDto> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var competency = unitOfWork.Competencies.Query()
            .Where(x => x.Id == id)
            .Select(x => Map(x))
            .FirstOrDefault()
            ?? throw new NotFoundException("Компетенция не найдена.");

        return Task.FromResult(competency);
    }

    public async Task<CompetencyDto> CreateAsync(CreateCompetencyRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        EnsureValidScore(request.MaxScore);

        var competency = new Competency
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            MaxScore = request.MaxScore,
            IsActive = request.IsActive
        };

        await unitOfWork.Competencies.AddAsync(competency, cancellationToken);
        await auditService.LogAsync("Competency", competency.Id, "Create", null, Map(competency), performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(competency);
    }

    public async Task<CompetencyDto> UpdateAsync(Guid id, UpdateCompetencyRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        EnsureValidScore(request.MaxScore);

        var competency = await unitOfWork.Competencies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Компетенция не найдена.");

        var oldValues = Map(competency);

        competency.Name = request.Name.Trim();
        competency.Description = request.Description.Trim();
        competency.Category = request.Category.Trim();
        competency.MaxScore = request.MaxScore;
        competency.IsActive = request.IsActive;

        unitOfWork.Competencies.Update(competency);
        await auditService.LogAsync("Competency", id, "Update", oldValues, Map(competency), performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(competency);
    }

    public async Task ArchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var c = await unitOfWork.Competencies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Компетенция не найдена.");
        if (c.IsArchived) throw new BusinessException("Компетенция уже в архиве.");
        c.IsArchived = true;
        c.ArchivedAt = DateTime.UtcNow;
        c.ArchivedById = performedById;
        unitOfWork.Competencies.Update(c);
        await auditService.LogAsync("Competency", id, "Archive", null, new { c.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task UnarchiveAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var c = await unitOfWork.Competencies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Компетенция не найдена.");
        if (!c.IsArchived) throw new BusinessException("Компетенция не в архиве.");
        c.IsArchived = false;
        c.ArchivedAt = null;
        c.ArchivedById = null;
        c.ArchivedReason = null;
        unitOfWork.Competencies.Update(c);
        await auditService.LogAsync("Competency", id, "Unarchive", null, new { c.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default)
    {
        var c = await unitOfWork.Competencies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Компетенция не найдена.");
        if (c.IsDeleted) throw new BusinessException("Компетенция уже удалена.");
        c.IsDeleted = true;
        c.DeletedAt = DateTime.UtcNow;
        c.DeletedById = performedById;
        c.DeletedReason = reason;
        unitOfWork.Competencies.Update(c);
        await auditService.LogAsync("Competency", id, "SoftDelete", null, new { c.IsDeleted, reason }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var c = await unitOfWork.Competencies.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Компетенция не найдена.");
        if (!c.IsDeleted && !c.IsArchived) throw new BusinessException("Компетенция не удалена и не в архиве.");
        if (c.IsDeleted)
        {
            c.IsDeleted = false;
            c.DeletedAt = null;
            c.DeletedById = null;
            c.DeletedReason = null;
        }
        if (c.IsArchived)
        {
            c.IsArchived = false;
            c.ArchivedAt = null;
            c.ArchivedById = null;
            c.ArchivedReason = null;
        }
        unitOfWork.Competencies.Update(c);
        await auditService.LogAsync("Competency", id, "Restore", null, new { c.IsDeleted, c.IsArchived }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static void EnsureValidScore(int maxScore)
    {
        if (maxScore <= 0 || maxScore > 5)
        {
            throw new BusinessException("Максимальный балл компетенции должен быть от 1 до 5.");
        }
    }

    private static CompetencyDto Map(Competency competency) => new(
        competency.Id,
        competency.Name,
        competency.Description,
        competency.Category,
        competency.MaxScore,
        competency.IsActive,
        competency.IsArchived,
        competency.IsDeleted);
}

public sealed class InterviewService(IUnitOfWork unitOfWork, IAuditService auditService) : IInterviewService
{
    public Task<IReadOnlyList<InterviewDto>> ListAsync(
        Guid? candidateId,
        Guid? vacancyId,
        InterviewStatus? status,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.Interviews.Query();

        if (candidateId.HasValue)
        {
            query = query.Where(x => x.CandidateId == candidateId.Value);
        }

        if (vacancyId.HasValue)
        {
            query = query.Where(x => x.VacancyId == vacancyId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                (x.Candidate != null && x.Candidate.FullName.ToLower().Contains(term))
                || (x.Vacancy != null && x.Vacancy.Title.ToLower().Contains(term))
                || (x.Interviewer != null && x.Interviewer.FullName.ToLower().Contains(term)));
        }

        var interviews = Project(query.OrderByDescending(x => x.PlannedDate)).ToList();

        return Task.FromResult<IReadOnlyList<InterviewDto>>(interviews);
    }

    public Task<InterviewDto> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var interview = Project(unitOfWork.Interviews.Query().Where(x => x.Id == id)).FirstOrDefault()
            ?? throw new NotFoundException("Собеседование не найдено.");

        return Task.FromResult(interview);
    }

    public async Task<InterviewDto> CreateAsync(CreateInterviewRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        if (request.PlannedDate == default)
        {
            throw new BusinessException("Укажите дату и время собеседования.");
        }

        var candidateExists = unitOfWork.Candidates.Query().Any(x => x.Id == request.CandidateId && !x.IsArchived);
        var vacancy = unitOfWork.Vacancies.Query()
            .Where(x => x.Id == request.VacancyId && x.IsActive)
            .FirstOrDefault();
        var interviewerExists = unitOfWork.Users.Query().Any(x => x.Id == request.InterviewerId && x.IsActive);

        if (!candidateExists)
        {
            throw new NotFoundException("Кандидат не найден или находится в архиве.");
        }

        if (vacancy is null)
        {
            throw new NotFoundException("Активная вакансия не найдена.");
        }

        if (!interviewerExists)
        {
            throw new NotFoundException("Интервьюер не найден или неактивен.");
        }

        var interview = new Interview
        {
            CandidateId = request.CandidateId,
            VacancyId = request.VacancyId,
            InterviewerId = request.InterviewerId,
            PlannedDate = request.PlannedDate,
            Comments = request.Comments
        };

        await unitOfWork.Interviews.AddAsync(interview, cancellationToken);

        var vacancyCompetencyIds = unitOfWork.VacancyCompetencies.Query()
            .Where(vc => vc.VacancyId == request.VacancyId)
            .Select(vc => vc.CompetencyId)
            .ToList();

        foreach (var competencyId in vacancyCompetencyIds)
        {
            var competency = unitOfWork.Competencies.Query().FirstOrDefault(x => x.Id == competencyId && x.IsActive)
                ?? throw new NotFoundException($"Компетенция {competencyId} не найдена или неактивна.");

            await unitOfWork.CompetencyMatrices.AddAsync(new CompetencyMatrix
            {
                InterviewId = interview.Id,
                CompetencyId = competency.Id,
                Score = 0
            }, cancellationToken);
        }

        await auditService.LogAsync("Interview", interview.Id, "Create", null, new { interview.CandidateId, interview.VacancyId, interview.PlannedDate }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetAsync(interview.Id, cancellationToken);
    }

    public async Task<InterviewDto> UpdateStatusAsync(Guid id, UpdateInterviewStatusRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var interview = await unitOfWork.Interviews.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Собеседование не найдено.");

        var oldValues = new { interview.Status, interview.Comments };

        interview.Status = request.Status;
        interview.Comments = request.Comments ?? interview.Comments;

        unitOfWork.Interviews.Update(interview);
        await auditService.LogAsync("Interview", id, "SetStatus", oldValues, new { interview.Status, interview.Comments }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task<InterviewDto> DecideAsync(Guid id, DecideInterviewRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var interview = await unitOfWork.Interviews.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Собеседование не найдено.");

        var oldValues = new { interview.Decision, interview.Status, interview.Comments };

        interview.Decision = request.Decision;
        interview.Status = InterviewStatus.Completed;
        interview.Comments = request.Comments ?? interview.Comments;

        unitOfWork.Interviews.Update(interview);
        await auditService.LogAsync("Interview", id, "Decide", oldValues, new { interview.Decision, interview.Status, interview.Comments }, performedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task<InterviewDto> UpsertMatrixAsync(Guid id, UpsertMatrixRequest request, Guid? evaluatedById, CancellationToken cancellationToken = default)
    {
        var interview = await unitOfWork.Interviews.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Собеседование не найдено.");

        if (interview.Status != InterviewStatus.Planned)
        {
            throw new BusinessException("Оценки можно редактировать только для запланированного собеседования.");
        }

        if (request.Items is null || request.Items.Count == 0)
        {
            throw new BusinessException("Матрица компетенций не может быть пустой.");
        }

        foreach (var item in request.Items)
        {
            var competency = unitOfWork.Competencies.Query().FirstOrDefault(x => x.Id == item.CompetencyId && x.IsActive)
                ?? throw new NotFoundException($"Компетенция {item.CompetencyId} не найдена или неактивна.");

            if (item.Score < 0 || item.Score > competency.MaxScore)
            {
                throw new BusinessException($"Оценка по компетенции \"{competency.Name}\" должна быть от 0 до {competency.MaxScore}.");
            }

            var existing = unitOfWork.CompetencyMatrices.Query()
                .FirstOrDefault(x => x.InterviewId == id && x.CompetencyId == item.CompetencyId);

            if (existing is null)
            {
                await unitOfWork.CompetencyMatrices.AddAsync(new CompetencyMatrix
                {
                    InterviewId = id,
                    CompetencyId = item.CompetencyId,
                    Score = item.Score,
                    Comment = item.Comment,
                    EvaluatedById = evaluatedById,
                    EvaluatedAt = DateTime.UtcNow
                }, cancellationToken);
            }
            else
            {
                existing.Score = item.Score;
                existing.Comment = item.Comment;
                existing.EvaluatedById = evaluatedById;
                existing.EvaluatedAt = DateTime.UtcNow;
                unitOfWork.CompetencyMatrices.Update(existing);
            }
        }

        await auditService.LogAsync("Interview", id, "UpsertMatrix", null, request.Items, evaluatedById, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    private static IQueryable<InterviewDto> Project(IQueryable<Interview> query) => query.Select(x => new InterviewDto(
        x.Id,
        x.CandidateId,
        x.Candidate == null ? string.Empty : x.Candidate.FullName,
        x.VacancyId,
        x.Vacancy == null ? string.Empty : x.Vacancy.Title,
        x.InterviewerId,
        x.Interviewer == null ? string.Empty : x.Interviewer.FullName,
        x.PlannedDate,
        x.Status,
        x.Decision,
        x.Comments,
        x.CreatedAt,
        x.Matrices
            .OrderBy(m => m.Competency == null ? string.Empty : m.Competency.Category)
            .ThenBy(m => m.Competency == null ? string.Empty : m.Competency.Name)
            .Select(m => new MatrixItemDto(
                m.Id,
                m.CompetencyId,
                m.Competency == null ? string.Empty : m.Competency.Name,
                m.Competency == null ? string.Empty : m.Competency.Category,
                m.Competency == null ? 0 : m.Competency.MaxScore,
                m.Score,
                m.Comment,
                m.EvaluatedById,
                m.EvaluatedAt))
            .ToList()));
}

public sealed class ReportService(IUnitOfWork unitOfWork, IPdfService pdfService) : IReportService
{
    public async Task<GeneratedReport> GenerateCandidateCardAsync(Guid candidateId, CancellationToken cancellationToken = default)
    {
        var candidate = unitOfWork.Candidates.Query().FirstOrDefault(x => x.Id == candidateId)
            ?? throw new NotFoundException("Кандидат не найден.");

        var interviewRows = unitOfWork.Interviews.Query()
            .Where(x => x.CandidateId == candidateId)
            .OrderByDescending(x => x.PlannedDate)
            .Select(x => new
            {
                x.PlannedDate,
                VacancyTitle = x.Vacancy == null ? string.Empty : x.Vacancy.Title,
                x.Decision,
                x.Status
            })
            .ToList();

        var interviews = interviewRows
            .Select(x => $"{x.PlannedDate:dd.MM.yyyy HH:mm} | {x.VacancyTitle} | {DecisionText(x.Decision)} | {StatusText(x.Status)}")
            .ToList();

        var document = new ReportDocument(
            "Карточка кандидата",
            candidate.FullName,
            new List<ReportSection>
            {
                new("Контакты", new[]
                {
                    $"Телефон: {candidate.Phone}",
                    $"Email: {candidate.Email ?? "-"}",
                    $"Город: {candidate.City}",
                    $"Желаемая позиция: {candidate.DesiredPosition}"
                }),
                new("Профиль", new[]
                {
                    $"Навыки: {candidate.Skills}",
                    $"Образование: {candidate.Education}",
                    $"Предыдущее место работы: {candidate.PreviousJob}"
                }),
                new("История собеседований", interviews.Count == 0 ? new[] { "Собеседования еще не заведены." } : interviews)
            });

        return new GeneratedReport($"{FileName(candidate.FullName)}-candidate-card.pdf", await pdfService.GenerateAsync(document, cancellationToken));
    }

    public async Task<GeneratedReport> GenerateInterviewProtocolAsync(Guid interviewId, CancellationToken cancellationToken = default)
    {
        var interview = unitOfWork.Interviews.Query()
            .Where(x => x.Id == interviewId)
            .Select(x => new
            {
                x.PlannedDate,
                x.Status,
                x.Decision,
                x.Comments,
                CandidateName = x.Candidate == null ? string.Empty : x.Candidate.FullName,
                VacancyTitle = x.Vacancy == null ? string.Empty : x.Vacancy.Title,
                InterviewerName = x.Interviewer == null ? string.Empty : x.Interviewer.FullName,
                Matrix = x.Matrices
                    .OrderBy(m => m.Competency == null ? string.Empty : m.Competency.Category)
                    .ThenBy(m => m.Competency == null ? string.Empty : m.Competency.Name)
                    .Select(m => new
                    {
                        Name = m.Competency == null ? string.Empty : m.Competency.Name,
                        Category = m.Competency == null ? string.Empty : m.Competency.Category,
                        MaxScore = m.Competency == null ? 0 : m.Competency.MaxScore,
                        m.Score,
                        m.Comment
                    })
                    .ToList()
            })
            .FirstOrDefault()
            ?? throw new NotFoundException("Собеседование не найдено.");

        var matrixLines = interview.Matrix.Count == 0
            ? new List<string> { "Матрица компетенций не заполнена." }
            : interview.Matrix.Select(x => $"{x.Category} / {x.Name}: {x.Score} из {x.MaxScore}. Комментарий: {x.Comment ?? "-"}").ToList();

        var document = new ReportDocument(
            "Протокол собеседования",
            $"{interview.CandidateName} - {interview.VacancyTitle}",
            new List<ReportSection>
            {
                new("Параметры", new[]
                {
                    $"Дата и время: {interview.PlannedDate:dd.MM.yyyy HH:mm}",
                    $"Интервьюер: {interview.InterviewerName}",
                    $"Статус: {StatusText(interview.Status)}",
                    $"Решение: {DecisionText(interview.Decision)}",
                    $"Комментарии: {interview.Comments ?? "-"}"
                }),
                new("Матрица компетенций", matrixLines)
            });

        return new GeneratedReport($"{FileName(interview.CandidateName)}-interview-protocol.pdf", await pdfService.GenerateAsync(document, cancellationToken));
    }

    public async Task<GeneratedReport> GenerateDecisionLetterAsync(Guid interviewId, CancellationToken cancellationToken = default)
    {
        var interview = unitOfWork.Interviews.Query()
            .Where(x => x.Id == interviewId)
            .Select(x => new
            {
                x.Decision,
                x.Comments,
                CandidateName = x.Candidate == null ? string.Empty : x.Candidate.FullName,
                CandidateEmail = x.Candidate == null ? null : x.Candidate.Email,
                VacancyTitle = x.Vacancy == null ? string.Empty : x.Vacancy.Title
            })
            .FirstOrDefault()
            ?? throw new NotFoundException("Собеседование не найдено.");

        var title = interview.Decision switch
        {
            InterviewDecision.Hired => "Оффер кандидату",
            InterviewDecision.Rejected => "Отказ кандидату",
            InterviewDecision.NextStage => "Приглашение на следующий этап",
            InterviewDecision.TalentPool => "Письмо в кадровый резерв",
            _ => "Письмо кандидату"
        };

        var body = interview.Decision switch
        {
            InterviewDecision.Hired => $"Поздравляем! Команда готова сделать предложение по вакансии \"{interview.VacancyTitle}\".",
            InterviewDecision.Rejected => $"Спасибо за интерес к вакансии \"{interview.VacancyTitle}\". На текущем этапе мы не готовы продолжить процесс.",
            InterviewDecision.NextStage => $"Приглашаем пройти следующий этап отбора по вакансии \"{interview.VacancyTitle}\".",
            InterviewDecision.TalentPool => $"Мы сохраним ваш профиль в кадровом резерве по направлению \"{interview.VacancyTitle}\".",
            _ => $"Решение по вакансии \"{interview.VacancyTitle}\" пока не принято."
        };

        var document = new ReportDocument(
            title,
            interview.CandidateName,
            new List<ReportSection>
            {
                new("Кандидат", new[]
                {
                    $"ФИО: {interview.CandidateName}",
                    $"Email: {interview.CandidateEmail ?? "-"}",
                    $"Вакансия: {interview.VacancyTitle}",
                    $"Решение: {DecisionText(interview.Decision)}"
                }),
                new("Текст письма", new[]
                {
                    body,
                    $"Комментарий интервьюера: {interview.Comments ?? "-"}"
                })
            });

        return new GeneratedReport($"{FileName(interview.CandidateName)}-decision-letter.pdf", await pdfService.GenerateAsync(document, cancellationToken));
    }

    private static string StatusText(InterviewStatus status) => status switch
    {
        InterviewStatus.Planned => "Запланировано",
        InterviewStatus.Completed => "Завершено",
        InterviewStatus.Cancelled => "Отменено",
        _ => status.ToString()
    };

    private static string DecisionText(InterviewDecision decision) => decision switch
    {
        InterviewDecision.Pending => "Ожидает решения",
        InterviewDecision.Hired => "Принять",
        InterviewDecision.Rejected => "Отказать",
        InterviewDecision.NextStage => "Следующий этап",
        InterviewDecision.TalentPool => "Кадровый резерв",
        _ => decision.ToString()
    };

    private static string FileName(string value)
    {
        var sanitized = string.Join("-", value.Split(Path.GetInvalidFileNameChars(), StringSplitOptions.RemoveEmptyEntries));
        return string.IsNullOrWhiteSpace(sanitized) ? "report" : sanitized.Trim().Replace(' ', '-').ToLowerInvariant();
    }
}
