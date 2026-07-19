# Onkar Pest Control API

ASP.NET Core Web API foundation for the Onkar Pest Control website.

The API currently contains a health endpoint and an optional Supabase PostgreSQL EF Core context. Database credentials, authentication, bookings, offers, notifications and admin features will be added in later roadmap phases.

Set the Supabase connection string through user-secrets or an environment-specific configuration value; never commit real credentials.

Configure locally from the API project directory:

```bash
dotnet user-secrets set "ConnectionStrings:Supabase" "<your-supabase-postgres-connection-string>"
dotnet ef migrations add InitialCreate
```

Run locally:

```bash
dotnet run
```

Health check:

```text
GET /api/health
```

Active services:

```text
GET /api/services
```

Public form endpoints:

```text
POST /api/service-requests
POST /api/contact-messages
```

Customer/admin booking endpoints:

```text
GET /api/service-requests/my
GET /api/service-requests/admin
PATCH /api/service-requests/admin/{id}
```

Admin booking fields now include lead source, payment status, service amount, advance, balance, payment mode, invoice number and completed date. Use lead source values such as Website, Phone, WhatsApp, Justdial, Referral, Repeat Customer or Other.
