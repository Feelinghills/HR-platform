FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY InterviewPlatform.slnx ./
COPY src/InterviewPlatform.API/InterviewPlatform.API.csproj src/InterviewPlatform.API/
COPY src/InterviewPlatform.Core/InterviewPlatform.Core.csproj src/InterviewPlatform.Core/
COPY src/InterviewPlatform.Domain/InterviewPlatform.Domain.csproj src/InterviewPlatform.Domain/
COPY src/InterviewPlatform.Infrastructure/InterviewPlatform.Infrastructure.csproj src/InterviewPlatform.Infrastructure/

RUN dotnet restore src/InterviewPlatform.API/InterviewPlatform.API.csproj

COPY . .
RUN dotnet publish src/InterviewPlatform.API/InterviewPlatform.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5126
ENV ASPNETCORE_URLS=http://+:5126

ENTRYPOINT ["dotnet", "InterviewPlatform.API.dll"]