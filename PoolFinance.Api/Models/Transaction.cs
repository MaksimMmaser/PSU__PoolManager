namespace PoolFinance.Api.Models;

public class Transaction
{
    public int Id { get; set; }
    
    public int? ClientId { get; set; }
    public Client? Client { get; set; }
    public string ClientName { get; set; } = string.Empty;

    public int? ServiceId { get; set; }
    public Service? Service { get; set; }
    public string ServiceItem { get; set; } = string.Empty;

    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "Card"; // 'Card' | 'Cash'
    public string Status { get; set; } = "Completed";   // 'Completed' | 'Pending' | 'Cancelled'
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}