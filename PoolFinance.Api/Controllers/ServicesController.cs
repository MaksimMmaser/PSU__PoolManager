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
        var services = await _context.Services.ToListAsync();
        return Ok(services);
    }
}