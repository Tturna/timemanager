using System.ComponentModel.DataAnnotations;

namespace back.Models;

public sealed record class CalendarEventModel
{
    [Required]
    public Guid Id { get; set; }
    [Required]
    public required string UserId { get; set; }
    [Required]
    public required EventTypeModel EventType { get; set; }
    [Required]
    public DateTime StartDateTime { get; set; }
    [Required]
    public DateTime EndDateTime { get; set; }
}
