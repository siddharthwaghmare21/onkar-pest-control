ALTER TABLE "Services"
ADD COLUMN IF NOT EXISTS "OfferPrice" numeric;

ALTER TABLE "Services"
ADD COLUMN IF NOT EXISTS "StartingPrice" numeric;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260720123000_AddServicePricingFields', '10.0.0'
WHERE NOT EXISTS (
    SELECT 1
    FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20260720123000_AddServicePricingFields'
);
