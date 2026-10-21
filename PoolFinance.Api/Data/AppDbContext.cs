using Microsoft.EntityFrameworkCore;
using PoolFinance.Api.Models;

namespace PoolFinance.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<PoolSession> PoolSessions => Set<PoolSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var seedDate = new DateTime(2026, 10, 15, 10, 0, 0, DateTimeKind.Utc);

        // Услуги
        modelBuilder.Entity<Service>().HasData(
            new Service { Id = 1, Title = "Single Entry", Price = 7.50m, Duration = "45 min", VisitsLimit = 1, Description = "Разовое посещение" },
            new Service { Id = 2, Title = "8 Visits Subscr.", Price = 45.00m, Duration = "1 month", VisitsLimit = 8, Description = "Абонемент на 8 посещений" },
            new Service { Id = 3, Title = "AquaAerobics", Price = 12.00m, Duration = "60 min", VisitsLimit = 1, Description = "Групповое занятие" },
            new Service { Id = 4, Title = "Pool Lane Hire", Price = 35.00m, Duration = "60 min", VisitsLimit = 1, Description = "Аренда дорожки" }
        );

        // Клиенты
        modelBuilder.Entity<Client>().HasData(
            new Client { Id = 1, FullName = "Ivan Ivanov", Category = "Students PGU", VisitsLeft = 8, CreatedAt = seedDate },
            new Client { Id = 2, FullName = "Alex Petrov", Category = "External", VisitsLeft = 1, CreatedAt = seedDate }
        );

        // Транзакции
        modelBuilder.Entity<Transaction>().HasData(
            new Transaction { Id = 20139, ClientId = 1, ClientName = "Ivan Ivanov", ServiceItem = "8 Visits Subscr.", Amount = 45.00m, PaymentMethod = "Card", Status = "Completed", CreatedAt = new DateTime(2026, 10, 14, 11, 30, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20128, ClientId = 2, ClientName = "Alex Petrov", ServiceItem = "Single Entry", Amount = 7.50m, PaymentMethod = "Cash", Status = "Completed", CreatedAt = new DateTime(2026, 10, 15, 9, 45, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20137, ClientId = 2, ClientName = "Alex Petrov", ServiceItem = "Single Entry", Amount = 7.50m, PaymentMethod = "Cash", Status = "Completed", CreatedAt = new DateTime(2026, 10, 15, 9, 45, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20134, ClientId = 1, ClientName = "Ivan Ivanov", ServiceItem = "8 Visits Subscr.", Amount = 7.50m, PaymentMethod = "Card", Status = "Completed", CreatedAt = new DateTime(2026, 10, 14, 7, 30, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20135, ClientId = 2, ClientName = "Alex Petrov", ServiceItem = "8 Visits Entry", Amount = 45.00m, PaymentMethod = "Cash", Status = "Completed", CreatedAt = new DateTime(2026, 10, 15, 9, 45, 0, DateTimeKind.Utc) }
        );

        // Начальные сеансы расписания дорожек (Monday)
        modelBuilder.Entity<PoolSession>().HasData(
            // Дорожка 1
            new PoolSession { Id = 1, LaneNumber = 1, DayOfWeek = "Monday", TimeSlot = "08:00 - 09:00", Activity = "FreeSwim", Occupancy = 4, MaxCapacity = 8 },
            new PoolSession { Id = 2, LaneNumber = 1, DayOfWeek = "Monday", TimeSlot = "09:00 - 10:00", Activity = "FreeSwim", Occupancy = 6, MaxCapacity = 8 },
            new PoolSession { Id = 3, LaneNumber = 1, DayOfWeek = "Monday", TimeSlot = "10:00 - 11:00", Activity = "AquaAerobics", Occupancy = 12, MaxCapacity = 12, Trainer = "Елена Смирнова" },
            new PoolSession { Id = 4, LaneNumber = 1, DayOfWeek = "Monday", TimeSlot = "17:00 - 18:00", Activity = "SportsClub", Occupancy = 8, MaxCapacity = 8, Trainer = "Дмитрий Волков" },

            // Дорожка 2
            new PoolSession { Id = 5, LaneNumber = 2, DayOfWeek = "Monday", TimeSlot = "08:00 - 09:00", Activity = "FreeSwim", Occupancy = 3, MaxCapacity = 8 },
            new PoolSession { Id = 6, LaneNumber = 2, DayOfWeek = "Monday", TimeSlot = "09:00 - 10:00", Activity = "FreeSwim", Occupancy = 5, MaxCapacity = 8 },
            new PoolSession { Id = 7, LaneNumber = 2, DayOfWeek = "Monday", TimeSlot = "10:00 - 11:00", Activity = "FreeSwim", Occupancy = 7, MaxCapacity = 8 },
            new PoolSession { Id = 8, LaneNumber = 2, DayOfWeek = "Monday", TimeSlot = "11:00 - 12:00", Activity = "PrivateHire", Occupancy = 1, MaxCapacity = 1, Trainer = "Аренда: ООО Газ" },
            new PoolSession { Id = 9, LaneNumber = 2, DayOfWeek = "Monday", TimeSlot = "17:00 - 18:00", Activity = "SportsClub", Occupancy = 8, MaxCapacity = 8, Trainer = "Дмитрий Волков" },

            // Дорожка 3
            new PoolSession { Id = 10, LaneNumber = 3, DayOfWeek = "Monday", TimeSlot = "08:00 - 09:00", Activity = "FreeSwim", Occupancy = 2, MaxCapacity = 8 },
            new PoolSession { Id = 11, LaneNumber = 3, DayOfWeek = "Monday", TimeSlot = "10:00 - 11:00", Activity = "FreeSwim", Occupancy = 4, MaxCapacity = 8 },
            new PoolSession { Id = 12, LaneNumber = 3, DayOfWeek = "Monday", TimeSlot = "11:00 - 12:00", Activity = "FreeSwim", Occupancy = 5, MaxCapacity = 8 },
            new PoolSession { Id = 13, LaneNumber = 3, DayOfWeek = "Monday", TimeSlot = "17:00 - 18:00", Activity = "FreeSwim", Occupancy = 6, MaxCapacity = 8 },

            // Дорожка 4
            new PoolSession { Id = 14, LaneNumber = 4, DayOfWeek = "Monday", TimeSlot = "09:00 - 10:00", Activity = "FreeSwim", Occupancy = 4, MaxCapacity = 8 },
            new PoolSession { Id = 15, LaneNumber = 4, DayOfWeek = "Monday", TimeSlot = "10:00 - 11:00", Activity = "PrivateHire", Occupancy = 1, MaxCapacity = 1 },
            new PoolSession { Id = 16, LaneNumber = 4, DayOfWeek = "Monday", TimeSlot = "17:00 - 18:00", Activity = "AquaAerobics", Occupancy = 10, MaxCapacity = 12, Trainer = "Елена Смирнова" }
        );
    }
}