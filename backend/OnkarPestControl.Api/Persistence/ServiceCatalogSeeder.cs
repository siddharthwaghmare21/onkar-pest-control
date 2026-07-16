using Microsoft.EntityFrameworkCore;
using OnkarPestControl.Api.Domain.Entities;

namespace OnkarPestControl.Api.Persistence;

public static class ServiceCatalogSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Services.AnyAsync()) return;

        db.Services.AddRange(
            new Service { Id = Guid.Parse("5a3d4c0a-9cc9-4f08-9ebd-1b80ccf2e101"), NameEnglish = "General Pest Control", NameMarathi = "सर्वसाधारण कीटक नियंत्रण", Slug = "general-pest-control", DescriptionEnglish = "Protection from cockroaches, ants, spiders, lizards, bed bugs, mosquitoes and common household pests.", DescriptionMarathi = "घरातील सामान्य कीटकांसाठी सुरक्षित आणि योग्य पद्धतीने केलेले नियंत्रण.", DisplayOrder = 1 },
            new Service { Id = Guid.Parse("5a3d4c0a-9cc9-4f08-9ebd-1b80ccf2e102"), NameEnglish = "Termite Control", NameMarathi = "वाळवी नियंत्रण", Slug = "termite-control", DescriptionEnglish = "Treatment and protection for wooden furniture, doors, walls and buildings affected by termites.", DescriptionMarathi = "लाकडी फर्निचर, दरवाजे, भिंती आणि इमारतींसाठी वाळवी नियंत्रण सेवा.", DisplayOrder = 2 },
            new Service { Id = Guid.Parse("5a3d4c0a-9cc9-4f08-9ebd-1b80ccf2e103"), NameEnglish = "Residential Pest Control", NameMarathi = "निवासी कीटक नियंत्रण", Slug = "residential-pest-control", DescriptionEnglish = "Pest control services for homes, apartments, flats, bungalows and housing societies.", DescriptionMarathi = "घरे, फ्लॅट्स, बंगलो आणि हाउसिंग सोसायटीसाठी pest control सेवा.", DisplayOrder = 3 },
            new Service { Id = Guid.Parse("5a3d4c0a-9cc9-4f08-9ebd-1b80ccf2e104"), NameEnglish = "Commercial Pest Control", NameMarathi = "व्यावसायिक कीटक नियंत्रण", Slug = "commercial-pest-control", DescriptionEnglish = "Pest control services for shops, offices, hotels, restaurants, hospitals, warehouses and institutions.", DescriptionMarathi = "दुकाने, कार्यालये, हॉटेल्स, रेस्टॉरंट्स, रुग्णालये आणि गोदामांसाठी सेवा.", DisplayOrder = 4 }
        );

        await db.SaveChangesAsync();
    }
}
