using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoolFinance.Api.Data;
using PoolFinance.Api.Models;

namespace PoolFinance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServicesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/services
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Service>>> GetServices()
    {
        var services = await _context.Services
            .OrderBy(s => s.Id)
            .ToListAsync();

        return Ok(services);
    }

    // POST: api/services (Добавление нового тарифа/услуги)
    [HttpPost]
    public async Task<ActionResult<Service>> CreateService([FromBody] CreateServiceDto dto)
    {
        var service = new Service
        {
            Title = dto.Title,
            Price = dto.Price,
            Duration = dto.Duration,
            Description = dto.Description,
            VisitsLimit = dto.VisitsLimit
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return Ok(service);
    }

    // DELETE: api/services/5 (Удаление услуги)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
        {
            return NotFound(new { message = "Услуга не найдена" });
        }

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

// DTO для создания услуги
public class CreateServiceDto
{
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Duration { get; set; } = "45 min";
    public string? Description { get; set; }
    public int VisitsLimit { get; set; } = 1;
}