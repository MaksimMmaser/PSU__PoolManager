namespace PoolFinance.Api.Models;

public class Client
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Category { get; set; } = "External"; // В кавычках!
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int VisitsLeft { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Transaction> Transactions { get; set; } = new();
}