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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Фиксированная дата для Seed Data
        var seedDate = new DateTime(2026, 10, 15, 10, 0, 0, DateTimeKind.Utc);

        // Начальные услуги бассейна
        modelBuilder.Entity<Service>().HasData(
            new Service { Id = 1, Title = "Single Entry", Price = 7.50m, Duration = "45 min", VisitsLimit = 1, Description = "Разовое посещение" },
            new Service { Id = 2, Title = "8 Visits Subscr.", Price = 45.00m, Duration = "1 month", VisitsLimit = 8, Description = "Абонемент на 8 посещений" },
            new Service { Id = 3, Title = "AquaAerobics", Price = 12.00m, Duration = "60 min", VisitsLimit = 1, Description = "Групповое занятие" },
            new Service { Id = 4, Title = "Pool Lane Hire", Price = 35.00m, Duration = "60 min", VisitsLimit = 1, Description = "Аренда дорожки" }
        );

        // Начальные клиенты
        modelBuilder.Entity<Client>().HasData(
            new Client { Id = 1, FullName = "Ivan Ivanov", Category = "Students PGU", VisitsLeft = 8, CreatedAt = seedDate },
            new Client { Id = 2, FullName = "Alex Petrov", Category = "External", VisitsLeft = 1, CreatedAt = seedDate }
        );

        // Начальные транзакции с точным фиксированным временем
        modelBuilder.Entity<Transaction>().HasData(
            new Transaction { Id = 20139, ClientId = 1, ClientName = "Ivan Ivanov", ServiceItem = "8 Visits Subscr.", Amount = 45.00m, PaymentMethod = "Card", Status = "Completed", CreatedAt = new DateTime(2026, 10, 14, 11, 30, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20128, ClientId = 2, ClientName = "Alex Petrov", ServiceItem = "Single Entry", Amount = 7.50m, PaymentMethod = "Cash", Status = "Completed", CreatedAt = new DateTime(2026, 10, 15, 9, 45, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20137, ClientId = 2, ClientName = "Alex Petrov", ServiceItem = "Single Entry", Amount = 7.50m, PaymentMethod = "Cash", Status = "Completed", CreatedAt = new DateTime(2026, 10, 15, 9, 45, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20134, ClientId = 1, ClientName = "Ivan Ivanov", ServiceItem = "8 Visits Subscr.", Amount = 7.50m, PaymentMethod = "Card", Status = "Completed", CreatedAt = new DateTime(2026, 10, 14, 7, 30, 0, DateTimeKind.Utc) },
            new Transaction { Id = 20135, ClientId = 2, ClientName = "Alex Petrov", ServiceItem = "8 Visits Entry", Amount = 45.00m, PaymentMethod = "Cash", Status = "Completed", CreatedAt = new DateTime(2026, 10, 15, 9, 45, 0, DateTimeKind.Utc) }
        );
    }
}