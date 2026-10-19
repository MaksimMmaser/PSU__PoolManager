namespace PoolFinance.Api.Models;

public class Service
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Duration { get; set; } = "45 min";
    public string? Description { get; set; }
    public int VisitsLimit { get; set; } = 1; // 1 для разового, 8 для абонемента
}