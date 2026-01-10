using Microsoft.EntityFrameworkCore;
using back.Models;

public class TimeManagerDBContext : DbContext
{
    public TimeManagerDBContext(DbContextOptions options) : base(options) { }

    public DbSet<CalendarEventModel> CalendarEvents { get; set; }
}
