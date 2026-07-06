using System.Security.Claims;
using InterviewPlatform.Core;
using InterviewPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        return Ok(await authService.LoginAsync(request, cancellationToken));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<object> Me()
    {
        return Ok(new
        {
            id = User.GetUserId(),
            email = User.FindFirstValue(ClaimTypes.Email),
            fullName = User.FindFirstValue(ClaimTypes.Name),
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }
}

[ApiController]
[Authorize]
[Route("api/users")]
public sealed class UsersController(IAuthService authService) : ControllerBase
{
    [Authorize(Roles = "Admin,HR")]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> List(CancellationToken cancellationToken)
    {
        return Ok(await authService.ListUsersAsync(cancellationToken));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(RegisterUserRequest request, CancellationToken cancellationToken)
    {
        var user = await authService.CreateUserAsync(request, User.GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(List), new { id = user.Id }, user);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<UserDto>> SetStatus(Guid id, UpdateUserStatusRequest request, CancellationToken cancellationToken)
    {
        return Ok(await authService.SetUserStatusAsync(id, request.IsActive, User.GetUserId(), cancellationToken));
    }
}

[ApiController]
[Authorize]
[Route("api/candidates")]
public sealed class CandidatesController(ICandidateService candidateService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CandidateDto>>> List(
        [FromQuery] string? search,
        [FromQuery] bool includeArchived,
        CancellationToken cancellationToken)
    {
        return Ok(await candidateService.ListAsync(search, includeArchived, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CandidateDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await candidateService.GetAsync(id, cancellationToken));
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPost]
    public async Task<ActionResult<CandidateDto>> Create(CreateCandidateRequest request, CancellationToken cancellationToken)
    {
        var candidate = await candidateService.CreateAsync(request, User.GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = candidate.Id }, candidate);
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CandidateDto>> Update(Guid id, UpdateCandidateRequest request, CancellationToken cancellationToken)
    {
        return Ok(await candidateService.UpdateAsync(id, request, User.GetUserId(), cancellationToken));
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPost("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        await candidateService.ArchiveAsync(id, User.GetUserId(), cancellationToken);
        return NoContent();
    }
}

[ApiController]
[Authorize]
[Route("api/vacancies")]
public sealed class VacanciesController(IVacancyService vacancyService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VacancyDto>>> List([FromQuery] bool activeOnly = true, CancellationToken cancellationToken = default)
    {
        return Ok(await vacancyService.ListAsync(activeOnly, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VacancyDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await vacancyService.GetAsync(id, cancellationToken));
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPost]
    public async Task<ActionResult<VacancyDto>> Create(CreateVacancyRequest request, CancellationToken cancellationToken)
    {
        var vacancy = await vacancyService.CreateAsync(request, User.GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = vacancy.Id }, vacancy);
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<VacancyDto>> Update(Guid id, UpdateVacancyRequest request, CancellationToken cancellationToken)
    {
        return Ok(await vacancyService.UpdateAsync(id, request, User.GetUserId(), cancellationToken));
    }
}

[ApiController]
[Authorize]
[Route("api/competencies")]
public sealed class CompetenciesController(ICompetencyService competencyService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CompetencyDto>>> List([FromQuery] bool activeOnly = true, CancellationToken cancellationToken = default)
    {
        return Ok(await competencyService.ListAsync(activeOnly, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CompetencyDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await competencyService.GetAsync(id, cancellationToken));
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPost]
    public async Task<ActionResult<CompetencyDto>> Create(CreateCompetencyRequest request, CancellationToken cancellationToken)
    {
        var competency = await competencyService.CreateAsync(request, User.GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = competency.Id }, competency);
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CompetencyDto>> Update(Guid id, UpdateCompetencyRequest request, CancellationToken cancellationToken)
    {
        return Ok(await competencyService.UpdateAsync(id, request, User.GetUserId(), cancellationToken));
    }
}

[ApiController]
[Authorize]
[Route("api/interviews")]
public sealed class InterviewsController(IInterviewService interviewService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InterviewDto>>> List(
        [FromQuery] Guid? candidateId,
        [FromQuery] Guid? vacancyId,
        [FromQuery] InterviewStatus? status,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        return Ok(await interviewService.ListAsync(candidateId, vacancyId, status, search, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InterviewDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await interviewService.GetAsync(id, cancellationToken));
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPost]
    public async Task<ActionResult<InterviewDto>> Create(CreateInterviewRequest request, CancellationToken cancellationToken)
    {
        var interview = await interviewService.CreateAsync(request, User.GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = interview.Id }, interview);
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<InterviewDto>> UpdateStatus(Guid id, UpdateInterviewStatusRequest request, CancellationToken cancellationToken)
    {
        return Ok(await interviewService.UpdateStatusAsync(id, request, User.GetUserId(), cancellationToken));
    }

    [Authorize(Roles = "Admin,HR")]
    [HttpPut("{id:guid}/matrix")]
    public async Task<ActionResult<InterviewDto>> UpsertMatrix(Guid id, UpsertMatrixRequest request, CancellationToken cancellationToken)
    {
        return Ok(await interviewService.UpsertMatrixAsync(id, request, User.GetUserId(), cancellationToken));
    }

    [Authorize(Roles = "DecisionMaker")]
    [HttpPost("{id:guid}/decision")]
    public async Task<ActionResult<InterviewDto>> Decide(Guid id, DecideInterviewRequest request, CancellationToken cancellationToken)
    {
        return Ok(await interviewService.DecideAsync(id, request, User.GetUserId(), cancellationToken));
    }
}

[ApiController]
[Authorize(Roles = "Admin,HR,DecisionMaker")]
[Route("api/reports")]
public sealed class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("candidates/{candidateId:guid}/card")]
    public async Task<IActionResult> CandidateCard(Guid candidateId, CancellationToken cancellationToken)
    {
        var report = await reportService.GenerateCandidateCardAsync(candidateId, cancellationToken);
        return File(report.Content, "application/pdf", report.FileName);
    }

    [HttpGet("interviews/{interviewId:guid}/protocol")]
    public async Task<IActionResult> InterviewProtocol(Guid interviewId, CancellationToken cancellationToken)
    {
        var report = await reportService.GenerateInterviewProtocolAsync(interviewId, cancellationToken);
        return File(report.Content, "application/pdf", report.FileName);
    }

    [HttpGet("interviews/{interviewId:guid}/decision-letter")]
    public async Task<IActionResult> DecisionLetter(Guid interviewId, CancellationToken cancellationToken)
    {
        var report = await reportService.GenerateDecisionLetterAsync(interviewId, cancellationToken);
        return File(report.Content, "application/pdf", report.FileName);
    }
}

internal static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }
}

[ApiController]
[Authorize(Roles = "Admin,HR")]
[Route("api/audit")]
public sealed class AuditController(IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AuditLogDto>>> List(
        [FromQuery] string? entityType,
        [FromQuery] Guid? entityId,
        CancellationToken cancellationToken)
    {
        var query = unitOfWork.AuditLogs.Query();

        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(x => x.EntityType == entityType);

        if (entityId.HasValue)
            query = query.Where(x => x.EntityId == entityId.Value);

        var logs = await query
            .OrderByDescending(x => x.PerformedAt)
            .Take(500)
            .ToListAsync(cancellationToken);

        var userIds = logs.Select(x => x.PerformedById).Where(x => x.HasValue).Select(x => x!.Value).Distinct().ToList();
        var users = userIds.Count > 0
            ? await unitOfWork.Users.Query().Where(x => userIds.Contains(x.Id)).ToListAsync(cancellationToken)
            : [];
        var userMap = users.ToDictionary(x => x.Id, x => x.FullName);

        var result = logs.Select(x => new AuditLogDto(
            x.Id,
            x.EntityType,
            x.EntityId,
            x.Action,
            x.OldValues,
            x.NewValues,
            x.PerformedById,
            x.PerformedById.HasValue && userMap.TryGetValue(x.PerformedById.Value, out var name) ? name : null,
            x.PerformedAt
        )).ToList();

        return Ok(result);
    }
}
