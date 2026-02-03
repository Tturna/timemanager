using System.ComponentModel.DataAnnotations;

public class NewEventDto
{
    [Required]
    public required string Title { get; set; }
    [Required]
    public DateTime StartDateTime { get; set; }
    [Required]
    public DateTime EndDateTime { get; set; }
    public string? CssColor { get; set; }
}
