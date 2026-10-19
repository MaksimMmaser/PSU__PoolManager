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
            .OrderBy(c => c.FullName)
            .ToListAsync();

        return Ok(clients);
    }
}