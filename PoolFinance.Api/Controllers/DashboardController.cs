using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoolFinance.Api.Data;

namespace PoolFinance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetDashboardSummary()
    {
        // 1. Общая выручка за всё время (или текущий месяц)
        var totalRevenue = await _context.Transactions
            .Where(t => t.Status == "Completed")
            .SumAsync(t => (decimal?)t.Amount) ?? 0m;

        // 2. Выручка за текущую неделю
        var weekAgo = DateTime.UtcNow.AddDays(-7);
        var weeklyRevenue = await _context.Transactions
            .Where(t => t.Status == "Completed" && t.CreatedAt >= weekAgo)
            .SumAsync(t => (decimal?)t.Amount) ?? 0m;

        // 3. Структура дохода по услугам (для первого Donut chart)
        var incomeByCategoryRaw = await _context.Transactions
            .GroupBy(t => t.ServiceItem)
            .Select(g => new
            {
                Name = g.Key,
                Total = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        var totalForCategories = incomeByCategoryRaw.Sum(x => x.Total);
        var incomeStructure = incomeByCategoryRaw.Select(x => new
        {
            Name = x.Name,
            Value = totalForCategories > 0 ? (int)Math.Round((x.Total / totalForCategories) * 100) : 0,
            Amount = x.Total
        }).ToList();

        // 4. Количество активных клиентов и распределение по категориям
        var totalMembers = await _context.Clients.CountAsync();
        var memberCategoriesRaw = await _context.Clients
            .GroupBy(c => c.Category)
            .Select(g => new
            {
                Name = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var memberCategories = memberCategoriesRaw.Select(x => new
        {
            Name = x.Name,
            Value = totalMembers > 0 ? (int)Math.Round(((double)x.Count / totalMembers) * 100) : 0,
            Count = x.Count
        }).ToList();

        // 5. Выручка по дням за последнюю неделю (для BarChart)
        var last7Days = Enumerable.Range(0, 7)
            .Select(i => DateTime.UtcNow.Date.AddDays(-6 + i))
            .ToList();

        var dailyRevenue = last7Days.Select(date =>
        {
            var dayTotal = _context.Transactions
                .Where(t => t.CreatedAt.Date == date && t.Status == "Completed")
                .Sum(t => (decimal?)t.Amount) ?? 0m;

            return new
            {
                Day = date.ToString("ddd"), // Mon, Tue, etc.
                Amount = dayTotal
            };
        }).ToList();

        return Ok(new
        {
            TotalRevenue = totalRevenue,
            WeeklyRevenue = weeklyRevenue,
            IncomeStructure = incomeStructure,
            TotalMembers = totalMembers,
            MemberCategories = memberCategories,
            DailyRevenue = dailyRevenue
        });
    }
}