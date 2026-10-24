using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoolFinance.Api.Data;
using PoolFinance.Api.Models;

namespace PoolFinance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly AppDbContext _context;

    public ScheduleController(AppDbContext context)
    {
        _context = context;
    }

    // 1. GET: api/schedule?day=Monday
    [HttpGet]
    public async Task<ActionResult<object>> GetSchedule([FromQuery] string day = "Monday")
    {
        var sessions = await _context.PoolSessions
            .Where(s => s.DayOfWeek.ToLower() == day.ToLower())
            .ToListAsync();

        var totalSwimmers = sessions.Sum(s => s.Occupancy);

        return Ok(new
        {
            Day = day,
            WaterTemperature = 27.4,
            TotalSwimmersInWater = totalSwimmers,
            PoolSpecs = "25м / 6 дорожек",
            Sessions = sessions
        });
    }

    // 2. POST: api/schedule/{id}/book (Запись по ClientId)
    [HttpPost("{id}/book")]
    public async Task<ActionResult<PoolSession>> BookSpot(int id, [FromBody] BookClientDto? dto)
    {
        var session = await _context.PoolSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { message = "Сеанс не найден" });

        if (session.Occupancy >= session.MaxCapacity)
            return BadRequest(new { message = "На этой дорожке больше нет свободных мест!" });

        Client? client = null;
        if (dto?.ClientId.HasValue == true && dto.ClientId > 0)
        {
            client = await _context.Clients.FindAsync(dto.ClientId.Value);
        }

        if (client == null && !string.IsNullOrWhiteSpace(dto?.ClientName))
        {
            var trimmed = dto.ClientName.Trim().ToLower();
            client = await _context.Clients.FirstOrDefaultAsync(c => c.FullName.Trim().ToLower() == trimmed);
        }

        if (client == null)
            return NotFound(new { message = "Клиент не найден в базе данных" });

        if (client.VisitsLeft <= 0)
            return BadRequest(new { message = $"У клиента {client.FullName} закончились оплаченные визиты (0 занятий)!" });

        var attendees = string.IsNullOrWhiteSpace(session.Trainer)
            ? new List<string>()
            : session.Trainer.Split(", ", StringSplitOptions.RemoveEmptyEntries).ToList();

        if (attendees.Contains(client.FullName))
            return BadRequest(new { message = $"{client.FullName} уже записан на эту дорожку!" });

        session.Occupancy += 1;
        attendees.Add(client.FullName);
        session.Trainer = string.Join(", ", attendees);

        client.VisitsLeft -= 1;

        await _context.SaveChangesAsync();
        return Ok(session);
    }

    // 3. POST: api/schedule/{id}/cancel-booking
    [HttpPost("{id}/cancel-booking")]
    public async Task<ActionResult<PoolSession>> CancelSpot(int id, [FromBody] BookClientDto? dto)
    {
        var session = await _context.PoolSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { message = "Сеанс не найден" });

        var clientName = dto?.ClientName?.Trim();

        if (session.Occupancy > 0)
        {
            session.Occupancy -= 1;
        }

        if (!string.IsNullOrWhiteSpace(clientName) && !string.IsNullOrWhiteSpace(session.Trainer))
        {
            var attendees = session.Trainer.Split(", ", StringSplitOptions.RemoveEmptyEntries).ToList();
            attendees.Remove(clientName);
            session.Trainer = attendees.Count > 0 ? string.Join(", ", attendees) : null;

            var trimmed = clientName.Trim().ToLower();
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.FullName.Trim().ToLower() == trimmed);
            if (client != null)
            {
                client.VisitsLeft += 1;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(session);
    }

    // 4. PATCH: api/schedule/{id}/capacity (ЖИВОЕ ИЗМЕНЕНИЕ ВМЕСТИМОСТИ ДОРОЖКИ)
    [HttpPatch("{id}/capacity")]
    public async Task<ActionResult<PoolSession>> UpdateCapacity(int id, [FromBody] UpdateCapacityDto dto)
    {
        var session = await _context.PoolSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { message = "Сеанс не найден" });

        if (dto.MaxCapacity <= 0)
            return BadRequest(new { message = "Вместимость должна быть больше нуля!" });

        // Защита: нельзя сделать лимит меньше, чем уже записано пловцов!
        if (dto.MaxCapacity < session.Occupancy)
            return BadRequest(new { message = $"Нельзя установить лимит {dto.MaxCapacity}, так как на дорожке уже плавает {session.Occupancy} чел.!" });

        session.MaxCapacity = dto.MaxCapacity;
        await _context.SaveChangesAsync();

        return Ok(session);
    }

    // 5. POST: api/schedule (Создание сеанса)
    [HttpPost]
    public async Task<ActionResult<PoolSession>> CreateSession([FromBody] CreateSessionDto dto)
    {
        var exists = await _context.PoolSessions.AnyAsync(s => 
            s.LaneNumber == dto.LaneNumber && 
            s.DayOfWeek.ToLower() == dto.DayOfWeek.ToLower() && 
            s.TimeSlot == dto.TimeSlot);

        if (exists)
            return BadRequest(new { message = "На этой дорожке в это время уже назначен сеанс!" });

        var session = new PoolSession
        {
            LaneNumber = dto.LaneNumber,
            DayOfWeek = dto.DayOfWeek,
            TimeSlot = dto.TimeSlot,
            Activity = dto.Activity,
            MaxCapacity = dto.MaxCapacity,
            Trainer = null,
            Occupancy = 0
        };

        _context.PoolSessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(session);
    }

    // 6. DELETE: api/schedule/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var session = await _context.PoolSessions.FindAsync(id);
        if (session == null)
            return NotFound();

        _context.PoolSessions.Remove(session);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class UpdateCapacityDto
{
    public int MaxCapacity { get; set; }
}

public class BookClientDto
{
    public int? ClientId { get; set; }
    public string? ClientName { get; set; }
}

public class CreateSessionDto
{
    public int LaneNumber { get; set; }
    public string DayOfWeek { get; set; } = "Monday";
    public string TimeSlot { get; set; } = string.Empty;
    public string Activity { get; set; } = "FreeSwim";
    public int MaxCapacity { get; set; } = 8;
    public string? Trainer { get; set; }
}