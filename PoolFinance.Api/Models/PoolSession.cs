namespace PoolFinance.Api.Models;

public class PoolSession
{
    public int Id { get; set; }
    
    // Номер дорожки: 1..6
    public int LaneNumber { get; set; }

    // День недели: Monday, Tuesday, etc.
    public string DayOfWeek { get; set; } = "Monday";

    // Временной слот: "08:00 - 09:00", "09:00 - 10:00" и т.д.
    public string TimeSlot { get; set; } = string.Empty;

    // Тип активности: FreeSwim, AquaAerobics, SportsClub, PrivateHire
    public string Activity { get; set; } = "FreeSwim";

    // Текущее число записанных людей
    public int Occupancy { get; set; } = 0;

    // Максимальная вместимость дорожки (например, 8 чел для плавания, 12 для аквы, 1 для аренды)
    public int MaxCapacity { get; set; } = 8;

    // Имя тренера или арендатора (если есть)
    public string? Trainer { get; set; }
}