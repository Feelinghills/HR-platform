using System.Net.Http.Json;
using System.Text.Json;
using InterviewPlatform.Core;
using InterviewPlatform.Domain.Models;
using Microsoft.Extensions.Options;

namespace InterviewPlatform.Infrastructure;

public sealed class RestAuthOptions
{
    public const string SectionName = "RestAuth";
    public string BaseUrl { get; set; } = "http://localhost:50052/api";
}

public sealed class RestAuthService : IAuthService
{
    private readonly HttpClient _http;
    private readonly RestAuthOptions _options;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public RestAuthService(HttpClient http, IOptions<RestAuthOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var response = await _http.PostAsJsonAsync($"{_options.BaseUrl}/auth/login", new
        {
            Email = request.Email,
            Password = request.Password
        }, JsonOptions, cancellationToken);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");

        return new AuthResponse(result.Token, MapUser(result.User));
    }

    public async Task<UserDto> CreateUserAsync(RegisterUserRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var response = await _http.PostAsJsonAsync($"{_options.BaseUrl}/users", new
        {
            Login = request.Login,
            Email = request.Email,
            Password = request.Password,
            FullName = request.FullName,
            Role = request.Role.ToString(),
            PerformedById = performedById?.ToString() ?? ""
        }, JsonOptions, cancellationToken);

        response.EnsureSuccessStatusCode();

        var user = await response.Content.ReadFromJsonAsync<UserDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");

        return user;
    }

    public async Task<IReadOnlyList<UserDto>> ListUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _http.GetFromJsonAsync<List<UserDto>>($"{_options.BaseUrl}/users", JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");

        return users;
    }

    public async Task<UserDto> SetUserStatusAsync(Guid id, bool isActive, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var response = await _http.PatchAsJsonAsync($"{_options.BaseUrl}/users/{id}/status", new
        {
            IsActive = isActive,
            PerformedById = performedById?.ToString() ?? ""
        }, JsonOptions, cancellationToken);

        response.EnsureSuccessStatusCode();

        var user = await response.Content.ReadFromJsonAsync<UserDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");

        return user;
    }

    public async Task DeleteUserAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default)
    {
        var response = await _http.PostAsJsonAsync($"{_options.BaseUrl}/users/{id}/delete", new
        {
            PerformedById = performedById?.ToString() ?? "",
            Reason = reason ?? ""
        }, JsonOptions, cancellationToken);

        response.EnsureSuccessStatusCode();
    }

    public async Task RestoreUserAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var response = await _http.PostAsJsonAsync($"{_options.BaseUrl}/users/{id}/restore", new
        {
            PerformedById = performedById?.ToString() ?? ""
        }, JsonOptions, cancellationToken);

        response.EnsureSuccessStatusCode();
    }

    private static UserDto MapUser(UserDto user) => user;

    private sealed class LoginResponseDto
    {
        public string Token { get; set; } = "";
        public UserDto User { get; set; } = null!;
    }
}
