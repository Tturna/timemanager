using System.ComponentModel.DataAnnotations;

public sealed record class EventTypeModel
{
    [Required]
    public Guid Id { get; set; }
    [Required]
    public required string Name { get; set; }
    public string CssColor { get; set; } = "#0099db";
}
