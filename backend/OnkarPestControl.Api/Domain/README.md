# Domain model plan

The API domain is designed for PostgreSQL and will be wired through Entity Framework Core in the database phase.

Initial entities:

- `User` — customer and admin profiles
- `Service` — bilingual public services
- `ServiceRequest` — guest or customer booking enquiries
- `ContactMessage` — contact form messages
- `Offer` — festival, seasonal and registered-customer offers
- `Package` — bundled services and discounts
- `Review` — customer reviews awaiting approval
- `GalleryItem` — service imagery and captions

No database connection, migrations, authentication or external services are included in this phase.
