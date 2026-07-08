using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using InterviewPlatform.API.Middleware;
using InterviewPlatform.Core;
using InterviewPlatform.Core.Services;
using InterviewPlatform.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins")
            .GetChildren()
            .Select(x => x.Value)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .ToArray();

        if (origins.Length == 0)
        {
            origins = ["http://localhost:3000", "http://localhost:5173"];
        }

        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.Configure<GrpcAuthOptions>(builder.Configuration.GetSection(GrpcAuthOptions.SectionName));
builder.Services.AddSingleton<IAuthService, GrpcAuthService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IVacancyService, VacancyService>();
builder.Services.AddScoped<ICompetencyService, CompetencyService>();
builder.Services.AddScoped<IInterviewService, InterviewService>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Объявляем саму схему авторизации
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите JWT токен"
    });

    // Указываем, что она обязательна для всех эндпоинтов
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

var jwtOptions = ReadJwtOptions(builder.Configuration);
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = signingKey,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    service = "InterviewPlatform.API",
    status = "running",
    docs = "Use /api/auth/login and JWT Bearer token for protected endpoints."
}));

app.MapControllers();

await app.Services.InitializeDatabaseAsync(app.Configuration, app.Logger);

app.Run();

static JwtOptions ReadJwtOptions(IConfiguration configuration)
{
    var section = configuration.GetSection(JwtOptions.SectionName);
    var options = new JwtOptions
    {
        Issuer = section["Issuer"] ?? "InterviewPlatform",
        Audience = section["Audience"] ?? "InterviewPlatform",
        Secret = section["Secret"] ?? "ChangeMeToASecretWithAtLeast32Characters",
        ExpirationMinutes = int.TryParse(section["ExpirationMinutes"], out var minutes) ? minutes : 120
    };

    if (Encoding.UTF8.GetByteCount(options.Secret) < 32)
    {
        throw new InvalidOperationException("JWT secret must contain at least 32 bytes.");
    }

    return options;
}
