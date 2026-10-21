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
    // Отдает все сеансы выбранного дня + динамические сенсоры бассейна
    [HttpGet]
    public async Task<ActionResult<object>> GetSchedule([FromQuery] string day = "Monday")
    {
        var sessions = await _context.PoolSessions
            .Where(s => s.DayOfWeek.ToLower() == day.ToLower())
            .ToListAsync();

        // Считаем общее число людей в воде прямо сейчас (по сумме Occupancy)
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

    // 2. POST: api/schedule/{id}/book (Записать посетителя: +1)
    [HttpPost("{id}/book")]
    public async Task<ActionResult<PoolSession>> BookSpot(int id)
    {
        var session = await _context.PoolSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { message = "Сеанс не найден" });

        if (session.Occupancy >= session.MaxCapacity)
            return BadRequest(new { message = "На этой дорожке больше нет свободных мест!" });

        session.Occupancy += 1;
        await _context.SaveChangesAsync();

        return Ok(session);
    }

    // 3. POST: api/schedule/{id}/cancel-booking (Отменить запись: -1)
    [HttpPost("{id}/cancel-booking")]
    public async Task<ActionResult<PoolSession>> CancelSpot(int id)
    {
        var session = await _context.PoolSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { message = "Сеанс не найден" });

        if (session.Occupancy > 0)
        {
            session.Occupancy -= 1;
            await _context.SaveChangesAsync();
        }

        return Ok(session);
    }

    // 4. POST: api/schedule (Создать новый сеанс на свободном слоте)
    [HttpPost]
    public async Task<ActionResult<PoolSession>> CreateSession([FromBody] CreateSessionDto dto)
    {
        // Проверяем, не занят ли уже этот слот на этой дорожке
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
            Trainer = dto.Trainer,
            Occupancy = 0
        };

        _context.PoolSessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(session);
    }

    // 5. DELETE: api/schedule/{id} (Освободить дорожку)
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

public class CreateSessionDto
{
    public int LaneNumber { get; set; }
    public string DayOfWeek { get; set; } = "Monday";
    public string TimeSlot { get; set; } = string.Empty;
    public string Activity { get; set; } = "FreeSwim";
    public int MaxCapacity { get; set; } = 8;
    public string? Trainer { get; set; }
}