using InterviewPlatform.Core;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (NotFoundException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status404NotFound, "not_found", ex.Message);
        }
        catch (BusinessException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "business_error", ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status403Forbidden, "forbidden", ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled API error.");
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError, "server_error", "Внутренняя ошибка сервера.");
        }
    }

    private static async Task WriteProblemAsync(HttpContext context, int statusCode, string title, string detail)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        await context.Response.WriteAsJsonAsync(problem);
    }
}
