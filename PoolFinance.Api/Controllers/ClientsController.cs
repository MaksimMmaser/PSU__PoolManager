using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoolFinance.Api.Data;
using PoolFinance.Api.Models;

namespace PoolFinance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/clients
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Client>>> GetClients()
    {
        var clients = await _context.Clients
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(clients);
    }

    // POST: api/clients (Создание нового клиента)
    [HttpPost]
    public async Task<ActionResult<Client>> CreateClient([FromBody] CreateClientDto dto)
    {
        var client = new Client
        {
            FullName = dto.FullName,
            Category = dto.Category,
            Phone = dto.Phone,
            Email = dto.Email,
            VisitsLeft = dto.VisitsLeft,
            CreatedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return Ok(client);
    }

    // POST: api/clients/5/check-in (Списание визита на ресепшене бассейна)
    [HttpPost("{id}/check-in")]
    public async Task<ActionResult<Client>> CheckIn(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null)
        {
            return NotFound(new { message = "Клиент не найден" });
        }

        if (client.VisitsLeft <= 0)
        {
            return BadRequest(new { message = "У клиента закончились оплаченные посещения!" });
        }

        // Списываем 1 посещение
        client.VisitsLeft -= 1;
        await _context.SaveChangesAsync();

        return Ok(client);
    }
}

// DTO для создания клиента
public class CreateClientDto
{
    public string FullName { get; set; } = string.Empty;
    public string Category { get; set; } = "External"; // 'Students PGU', 'Staff PGU', 'External'
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int VisitsLeft { get; set; } = 8;
}