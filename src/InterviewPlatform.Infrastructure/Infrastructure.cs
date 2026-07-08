using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using InterviewPlatform.Core;
using InterviewPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InterviewPlatform.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<Competency> Competencies => Set<Competency>();
    public DbSet<CompetencyMatrix> CompetencyMatrices => Set<CompetencyMatrix>();
    public DbSet<VacancyCompetency> VacancyCompetencies => Set<VacancyCompetency>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<OfferTemplate> OfferTemplates => Set<OfferTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Login).IsUnique();
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Login).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.PasswordHash).HasMaxLength(512).IsRequired();
            entity.Property(x => x.FullName).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.HasOne(x => x.DeletedBy).WithMany().HasForeignKey(x => x.DeletedById).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Candidate>(entity =>
        {
            entity.ToTable("candidates");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.FullName);
            entity.HasIndex(x => x.Phone);
            entity.Property(x => x.FullName).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Phone).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.City).HasMaxLength(128).IsRequired();
            entity.Property(x => x.DesiredPosition).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Education).HasMaxLength(1024).IsRequired();
            entity.Property(x => x.PreviousJob).HasMaxLength(512).IsRequired();
            entity.Property(x => x.Skills).HasMaxLength(2048).IsRequired();
            entity.HasOne(x => x.CreatedBy)
                .WithMany(x => x.CreatedCandidates)
                .HasForeignKey(x => x.CreatedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(x => x.ArchivedBy)
                .WithMany()
                .HasForeignKey(x => x.ArchivedById)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(x => x.DeletedBy)
                .WithMany()
                .HasForeignKey(x => x.DeletedById)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Vacancy>(entity =>
        {
            entity.ToTable("vacancies");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Title);
            entity.Property(x => x.Title).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(2048).IsRequired();
            entity.Property(x => x.Requirements).HasMaxLength(2048).IsRequired();
            entity.HasOne(x => x.ArchivedBy).WithMany().HasForeignKey(x => x.ArchivedById).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(x => x.DeletedBy).WithMany().HasForeignKey(x => x.DeletedById).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Interview>(entity =>
        {
            entity.ToTable("interviews");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.PlannedDate);
            entity.HasIndex(x => new { x.CandidateId, x.VacancyId });
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(x => x.Decision).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(x => x.Comments).HasMaxLength(2048);
            entity.Property(x => x.IsArchived).HasDefaultValue(false);
            entity.HasOne(x => x.Candidate)
                .WithMany(x => x.Interviews)
                .HasForeignKey(x => x.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Vacancy)
                .WithMany(x => x.Interviews)
                .HasForeignKey(x => x.VacancyId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Interviewer)
                .WithMany(x => x.Interviews)
                .HasForeignKey(x => x.InterviewerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Competency>(entity =>
        {
            entity.ToTable("competencies");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.Category, x.Name }).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(1024).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(128).IsRequired();
            entity.HasOne(x => x.ArchivedBy).WithMany().HasForeignKey(x => x.ArchivedById).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(x => x.DeletedBy).WithMany().HasForeignKey(x => x.DeletedById).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<VacancyCompetency>(entity =>
        {
            entity.ToTable("vacancy_competencies");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.VacancyId, x.CompetencyId }).IsUnique();
            entity.HasOne(x => x.Vacancy)
                .WithMany(x => x.VacancyCompetencies)
                .HasForeignKey(x => x.VacancyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Competency)
                .WithMany(x => x.VacancyCompetencies)
                .HasForeignKey(x => x.CompetencyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CompetencyMatrix>(entity =>
        {
            entity.ToTable("competency_matrices");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.InterviewId, x.CompetencyId }).IsUnique();
            entity.Property(x => x.Comment).HasMaxLength(1024);
            entity.HasOne(x => x.Interview)
                .WithMany(x => x.Matrices)
                .HasForeignKey(x => x.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Competency)
                .WithMany(x => x.Matrices)
                .HasForeignKey(x => x.CompetencyId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.EvaluatedBy)
                .WithMany(x => x.Evaluations)
                .HasForeignKey(x => x.EvaluatedById)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.EntityType, x.EntityId });
            entity.Property(x => x.EntityType).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Action).HasMaxLength(128).IsRequired();
            entity.HasOne(x => x.PerformedBy)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.PerformedById)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OfferTemplate>(entity =>
        {
            entity.ToTable("offer_templates");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(128).IsRequired();
            entity.Property(x => x.HtmlTemplate).IsRequired();
            entity.Property(x => x.Type).HasConversion<string>().HasMaxLength(32).IsRequired();
        });
    }
}

public sealed class Repository<T>(AppDbContext dbContext) : IRepository<T> where T : class
{
    public IQueryable<T> Query() => dbContext.Set<T>();

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Set<T>().FindAsync([id], cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await dbContext.Set<T>().AddAsync(entity, cancellationToken);
    }

    public void Update(T entity) => dbContext.Set<T>().Update(entity);

    public void Remove(T entity) => dbContext.Set<T>().Remove(entity);
}

public sealed class UnitOfWork(AppDbContext dbContext) : IUnitOfWork
{
    private IRepository<User>? _users;
    private IRepository<Candidate>? _candidates;
    private IRepository<Vacancy>? _vacancies;
    private IRepository<Interview>? _interviews;
    private IRepository<Competency>? _competencies;
    private IRepository<CompetencyMatrix>? _competencyMatrices;
    private IRepository<VacancyCompetency>? _vacancyCompetencies;
    private IRepository<AuditLog>? _auditLogs;
    private IRepository<OfferTemplate>? _offerTemplates;

    public IRepository<User> Users => _users ??= new Repository<User>(dbContext);
    public IRepository<Candidate> Candidates => _candidates ??= new Repository<Candidate>(dbContext);
    public IRepository<Vacancy> Vacancies => _vacancies ??= new Repository<Vacancy>(dbContext);
    public IRepository<Interview> Interviews => _interviews ??= new Repository<Interview>(dbContext);
    public IRepository<Competency> Competencies => _competencies ??= new Repository<Competency>(dbContext);
    public IRepository<CompetencyMatrix> CompetencyMatrices => _competencyMatrices ??= new Repository<CompetencyMatrix>(dbContext);
    public IRepository<VacancyCompetency> VacancyCompetencies => _vacancyCompetencies ??= new Repository<VacancyCompetency>(dbContext);
    public IRepository<AuditLog> AuditLogs => _auditLogs ??= new Repository<AuditLog>(dbContext);
    public IRepository<OfferTemplate> OfferTemplates => _offerTemplates ??= new Repository<OfferTemplate>(dbContext);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => dbContext.SaveChangesAsync(cancellationToken);
}

public sealed class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, KeySize);
        return $"PBKDF2$SHA256${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";
    }

    public bool Verify(string password, string passwordHash)
    {
        var parts = passwordHash.Split('$');

        if (parts.Length != 5 || parts[0] != "PBKDF2" || parts[1] != "SHA256")
        {
            return false;
        }

        var iterations = int.Parse(parts[2]);
        var salt = Convert.FromBase64String(parts[3]);
        var expectedKey = Convert.FromBase64String(parts[4]);
        var actualKey = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expectedKey.Length);

        return CryptographicOperations.FixedTimeEquals(actualKey, expectedKey);
    }
}

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "InterviewPlatform";
    public string Audience { get; set; } = "InterviewPlatform";
    public string Secret { get; set; } = "ChangeMeToASecretWithAtLeast32Characters";
    public int ExpirationMinutes { get; set; } = 120;
}

public sealed class JwtTokenService(IOptions<JwtOptions> options) : IJwtTokenService
{
    public string Generate(User user)
    {
        var jwt = options.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(jwt.ExpirationMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(jwt.Issuer, jwt.Audience, claims, expires: expires, signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public sealed class QuestPdfService : IPdfService
{
    public Task<byte[]> GenerateAsync(ReportDocument document, CancellationToken cancellationToken = default)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var bytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(10));

                page.Header().Column(column =>
                {
                    column.Item().Text(document.Title).SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);
                    column.Item().Text(document.Subtitle).FontSize(12).FontColor(Colors.Grey.Darken2);
                    column.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                });

                page.Content().PaddingVertical(16).Column(column =>
                {
                    column.Spacing(12);

                    foreach (var section in document.Sections)
                    {
                        column.Item().Text(section.Title).SemiBold().FontSize(13).FontColor(Colors.Grey.Darken3);

                        foreach (var line in section.Lines)
                        {
                            column.Item().Text(line).FontSize(10);
                        }
                    }
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Страница ");
                    text.CurrentPageNumber();
                    text.Span(" из ");
                    text.TotalPages();
                });
            });
        }).GeneratePdf();

        return Task.FromResult(bytes);
    }
}

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=interview_platform;Username=postgres;Password=postgres";

        services.AddSingleton(Options.Create(ReadJwtOptions(configuration)));
        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPdfService, QuestPdfService>();

        return services;
    }

    private static JwtOptions ReadJwtOptions(IConfiguration configuration)
    {
        var section = configuration.GetSection(JwtOptions.SectionName);
        return new JwtOptions
        {
            Issuer = section["Issuer"] ?? "InterviewPlatform",
            Audience = section["Audience"] ?? "InterviewPlatform",
            Secret = section["Secret"] ?? "ChangeMeToASecretWithAtLeast32Characters",
            ExpirationMinutes = int.TryParse(section["ExpirationMinutes"], out var minutes) ? minutes : 120
        };
    }

    public static async Task InitializeDatabaseAsync(this IServiceProvider services, IConfiguration configuration, ILogger logger)
    {
        var applySchema = !bool.TryParse(configuration["Database:ApplySchemaOnStartup"], out var parsed) || parsed;

        if (!applySchema)
        {
            return;
        }

        await using var scope = services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        try
        {
            await dbContext.Database.MigrateAsync();
            await SeedAsync(dbContext, passwordHasher);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Не удалось автоматически подготовить PostgreSQL. Проверьте строку подключения и состояние БД.");
        }
    }

    private static async Task SeedAsync(AppDbContext dbContext, IPasswordHasher passwordHasher)
    {
        if (!dbContext.Users.Any())
        {
            dbContext.Users.AddRange(
                new User
                {
                    Login = "admin",
                    Email = "admin@example.com",
                    FullName = "Администратор",
                    Role = UserRole.Admin,
                    PasswordHash = passwordHasher.Hash("Admin123!")
                },
                new User
                {
                    Login = "hr",
                    Email = "hr@example.com",
                    FullName = "Специалист отдела кадров",
                    Role = UserRole.HR,
                    PasswordHash = passwordHasher.Hash("Hr123!")
                },
                new User
                {
                    Login = "reshala",
                    Email = "decision@example.com",
                    FullName = "Решала",
                    Role = UserRole.DecisionMaker,
                    PasswordHash = passwordHasher.Hash("Decision123!")
                });
        }

        if (!dbContext.Vacancies.Any())
        {
            dbContext.Vacancies.Add(new Vacancy
            {
                Title = ".NET Backend Developer",
                Description = "Разработка серверной части платформы технических собеседований.",
                Requirements = "C#, ASP.NET Core, EF Core, PostgreSQL, REST API."
            });
        }

        if (!dbContext.Competencies.Any())
        {
            dbContext.Competencies.AddRange(
                new Competency { Category = "Backend", Name = "C# и .NET", Description = "Знание языка C#, ASP.NET Core и базовых паттернов backend-разработки.", MaxScore = 5 },
                new Competency { Category = "Database", Name = "SQL и PostgreSQL", Description = "Понимание реляционной модели, индексов, запросов и транзакций.", MaxScore = 5 },
                new Competency { Category = "Soft Skills", Name = "Коммуникация", Description = "Умение объяснять решения, задавать вопросы и работать в команде.", MaxScore = 5 });
        }

        if (!dbContext.OfferTemplates.Any())
        {
            dbContext.OfferTemplates.AddRange(
                new OfferTemplate { Name = "Оффер", Type = TemplateType.Offer, HtmlTemplate = "<h1>Оффер</h1><p>{{CandidateName}}</p>" },
                new OfferTemplate { Name = "Отказ", Type = TemplateType.Rejection, HtmlTemplate = "<h1>Отказ</h1><p>{{CandidateName}}</p>" },
                new OfferTemplate { Name = "Протокол", Type = TemplateType.Protocol, HtmlTemplate = "<h1>Протокол собеседования</h1><p>{{CandidateName}}</p>" },
                new OfferTemplate { Name = "Карточка кандидата", Type = TemplateType.CandidateCard, HtmlTemplate = "<h1>Карточка кандидата</h1><p>{{CandidateName}}</p>" });
        }

        await dbContext.SaveChangesAsync();
    }
}

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=interview_platform;Username=postgres;Password=postgres")
            .Options;

        return new AppDbContext(options);
    }
}
