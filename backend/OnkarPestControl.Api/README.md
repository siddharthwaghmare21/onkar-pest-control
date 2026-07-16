# Onkar Pest Control API

ASP.NET Core Web API foundation for the Onkar Pest Control website.

The API currently contains a health endpoint and an optional Supabase PostgreSQL EF Core context. Database credentials, authentication, bookings, offers, notifications and admin features will be added in later roadmap phases.

Set the Supabase connection string through user-secrets or an environment-specific configuration value; never commit real credentials.

Run locally:

```bash
dotnet run
```

Health check:

```text
GET /api/health
```
