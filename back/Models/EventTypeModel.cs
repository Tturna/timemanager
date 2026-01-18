using System.ComponentModel.DataAnnotations;

public sealed record class EventTypeModel
{
    [Required]
    public Guid Id { get; set; }
    [Required]
    public required string Name { get; set; }
}
