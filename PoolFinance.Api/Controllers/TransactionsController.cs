using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoolFinance.Api.Data;
using PoolFinance.Api.Models;

namespace PoolFinance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/transactions
    // GET: api/transactions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetTransactions()
    {
        var transactions = await _context.Transactions
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                DateTime = t.CreatedAt.ToString("dd MMM yyyy, HH:mm", System.Globalization.CultureInfo.InvariantCulture),
                CreatedAt = t.CreatedAt, // Точный ISO-формат для фильтров!
                t.ClientName,
                t.ServiceItem,
                t.Amount,
                t.PaymentMethod,
                t.Status
            })
            .ToListAsync();

        return Ok(transactions);
    }

    // POST: api/transactions
    // POST: api/transactions
    [HttpPost]
    public async Task<ActionResult<object>> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        var transaction = new Transaction
        {
            ClientName = dto.ClientName,
            ServiceItem = dto.ServiceItem,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            Status = "Completed",
            CreatedAt = DateTime.UtcNow
        };

        // АВТОМАТИЧЕСКОЕ НАЧИСЛЕНИЕ ВИЗИТОВ:
        // Если клиент есть в базе — прибавляем ему визиты из купленного тарифа!
        var client = await _context.Clients.FirstOrDefaultAsync(c => c.FullName.ToLower() == dto.ClientName.Trim().ToLower());
        var service = await _context.Services.FirstOrDefaultAsync(s => s.Title == dto.ServiceItem);

        if (client != null && service != null)
        {
            client.VisitsLeft += service.VisitsLimit;
        }

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            transaction.Id,
            DateTime = transaction.CreatedAt.ToString("dd MMM yyyy, HH:mm", System.Globalization.CultureInfo.InvariantCulture),
            CreatedAt = transaction.CreatedAt,
            transaction.ClientName,
            transaction.ServiceItem,
            transaction.Amount,
            transaction.PaymentMethod,
            transaction.Status
        });
    }

// DTO (Data Transfer Object) - модель входящих данных от React
public class CreateTransactionDto
{
    public string ClientName { get; set; } = string.Empty;
    public string ServiceItem { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Card";
}}