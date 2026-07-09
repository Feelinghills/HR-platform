using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using InterviewPlatform.Core;
using InterviewPlatform.Domain.Models;
using Microsoft.Extensions.Options;

namespace InterviewPlatform.Infrastructure;

public sealed class RestAuthOptions
{
    public const string SectionName = "RestAuth";
    public string BaseUrl { get; set; } = "http://localhost:50052/api";
    public string InternalKey { get; set; } = "hr-platform-internal-2026";
}

public sealed class RestAuthService : IAuthService
{
    private readonly HttpClient _http;
    private readonly RestAuthOptions _options;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public RestAuthService(HttpClient http, IOptions<RestAuthOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string url, object? body = null)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Add("X-Internal-Key", _options.InternalKey);
        if (body is not null)
        {
            request.Content = JsonContent.Create(body, options: JsonOptions);
        }
        return request;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Post, $"{_options.BaseUrl}/auth/login", new
        {
            Email = request.Email,
            Password = request.Password
        });
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");
        return new AuthResponse(result.Token, MapUser(result.User));
    }

    public async Task<UserDto> CreateUserAsync(RegisterUserRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Post, $"{_options.BaseUrl}/users", new
        {
            Login = request.Login,
            Email = request.Email,
            Password = request.Password,
            FullName = request.FullName,
            Role = request.Role.ToString(),
            PerformedById = performedById?.ToString() ?? ""
        });
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<UserDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");
    }

    public async Task<IReadOnlyList<UserDto>> ListUsersAsync(CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Get, $"{_options.BaseUrl}/users");
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<UserDto>>(JsonOptions, cancellationToken) ?? [];
    }

    public async Task<UserDto> SetUserStatusAsync(Guid id, bool isActive, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Patch, $"{_options.BaseUrl}/users/{id}/status", new
        {
            IsActive = isActive,
            PerformedById = performedById?.ToString() ?? ""
        });
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<UserDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Put, $"{_options.BaseUrl}/users/{id}", new
        {
            FullName = request.FullName,
            Email = request.Email,
            Role = request.Role?.ToString(),
            PerformedById = performedById?.ToString() ?? ""
        });
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<UserDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Empty response from auth service");
    }

    public async Task DeleteUserAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Post, $"{_options.BaseUrl}/users/{id}/delete", new
        {
            PerformedById = performedById?.ToString() ?? "",
            Reason = reason ?? ""
        });
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task RestoreUserAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Post, $"{_options.BaseUrl}/users/{id}/restore", new
        {
            PerformedById = performedById?.ToString() ?? ""
        });
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task<IReadOnlyList<UserDto>> ListDeletedUsersAsync(CancellationToken cancellationToken = default)
    {
        var msg = CreateRequest(HttpMethod.Get, $"{_options.BaseUrl}/users/deleted");
        var response = await _http.SendAsync(msg, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<UserDto>>(JsonOptions, cancellationToken) ?? [];
    }

    private static UserDto MapUser(UserDto user) => user;

    private sealed class LoginResponseDto
    {
        public string Token { get; set; } = "";
        public UserDto User { get; set; } = null!;
    }
}
