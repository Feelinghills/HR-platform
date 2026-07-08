using Grpc.Net.Client;
using InterviewPlatform.Core;
using InterviewPlatform.Domain.Models;
using Microsoft.Extensions.Options;

namespace InterviewPlatform.Infrastructure;

public sealed class GrpcAuthOptions
{
    public const string SectionName = "GrpcAuth";
    public string Address { get; set; } = "http://localhost:50051";
}

public sealed class GrpcAuthService : IAuthService, IDisposable
{
    private readonly Protos.Auth.AuthServiceClient _client;
    private readonly GrpcChannel _channel;

    public GrpcAuthService(IOptions<GrpcAuthOptions> options)
    {
        _channel = GrpcChannel.ForAddress(options.Value.Address);
        _client = new Protos.Auth.AuthServiceClient(_channel);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var reply = await _client.LoginAsync(new Protos.LoginRequest
        {
            Login = request.Email,
            Password = request.Password
        }, cancellationToken: cancellationToken);

        return new AuthResponse(reply.Token, MapUser(reply.User));
    }

    public async Task<UserDto> CreateUserAsync(RegisterUserRequest request, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var reply = await _client.RegisterAsync(new Protos.RegisterRequest
        {
            Login = request.Login,
            Email = request.Email,
            Password = request.Password,
            FullName = request.FullName,
            Role = request.Role.ToString(),
            PerformedById = performedById?.ToString() ?? ""
        }, cancellationToken: cancellationToken);

        return MapUser(reply.User);
    }

    public async Task<IReadOnlyList<UserDto>> ListUsersAsync(CancellationToken cancellationToken = default)
    {
        var reply = await _client.ListUsersAsync(new Protos.ListUsersRequest(), cancellationToken: cancellationToken);

        return reply.Users.Select(MapUser).ToList();
    }

    public async Task<UserDto> SetUserStatusAsync(Guid id, bool isActive, Guid? performedById, CancellationToken cancellationToken = default)
    {
        var reply = await _client.SetUserStatusAsync(new Protos.SetUserStatusRequest
        {
            UserId = id.ToString(),
            IsActive = isActive,
            PerformedById = performedById?.ToString() ?? ""
        }, cancellationToken: cancellationToken);

        return MapUser(reply.User);
    }

    public async Task DeleteUserAsync(Guid id, Guid? performedById, string? reason, CancellationToken cancellationToken = default)
    {
        await _client.DeleteUserAsync(new Protos.DeleteUserRequest
        {
            UserId = id.ToString(),
            PerformedById = performedById?.ToString() ?? "",
            Reason = reason ?? ""
        }, cancellationToken: cancellationToken);
    }

    public async Task RestoreUserAsync(Guid id, Guid? performedById, CancellationToken cancellationToken = default)
    {
        await _client.RestoreUserAsync(new Protos.RestoreUserRequest
        {
            UserId = id.ToString(),
            PerformedById = performedById?.ToString() ?? ""
        }, cancellationToken: cancellationToken);
    }

    public void Dispose()
    {
        _channel?.Dispose();
    }

    private static UserDto MapUser(Protos.User user) => new(
        Guid.Parse(user.Id),
        user.Login,
        user.Email,
        user.FullName,
        Enum.Parse<UserRole>(user.Role),
        user.IsActive,
        DateTime.Parse(user.CreatedAt));
}
