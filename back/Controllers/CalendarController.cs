using Microsoft.AspNetCore.Mvc;
using back.Models;

public class CalendarController(TimeManagerDBContext dbContext) : Controller
{
    [HttpGet]
    public IActionResult Events()
    {
        var events = dbContext.CalendarEvents.ToArray();

        return new JsonResult(events);
    }

    [HttpPost]
    public IActionResult AddEvent([FromForm] NewEventDto newEventDto)
    {
        if (!ModelState.IsValid)
        {
            return new BadRequestResult();
        }

        var startDateTime = DateTime.SpecifyKind(newEventDto.StartDateTime, DateTimeKind.Utc);
        var endDateTime = DateTime.SpecifyKind(newEventDto.EndDateTime, DateTimeKind.Utc);

        var newEvent = new CalendarEventModel()
        {
            Id = Guid.CreateVersion7(),
            Title = newEventDto.Title,
            StartDateTime = startDateTime,
            EndDateTime = endDateTime
        };

        try
        {
            dbContext.CalendarEvents.Add(newEvent);
            dbContext.SaveChanges();
        }
        catch
        {
            throw;
        }

        return new CreatedResult();
    }

    [HttpPut]
    public IActionResult EditEvent([FromBody] NewEventDto newEventDto, Guid id)
    {
        if (!ModelState.IsValid)
        {
            Console.WriteLine($"Error count: {ModelState.ErrorCount}");

            foreach (var val in ModelState)
            {
                var modelStateEntry = val.Value;

                foreach (var error in modelStateEntry.Errors)
                {
                    Console.WriteLine(error.ErrorMessage);
                }
            }

            return new BadRequestResult();
        }

        var eventToEdit = dbContext.CalendarEvents.Find(id);

        if (eventToEdit is null)
        {
            return new NotFoundResult();
        }

        var newStartDateTime = DateTime.SpecifyKind(newEventDto.StartDateTime, DateTimeKind.Utc);
        var newEndDateTime = DateTime.SpecifyKind(newEventDto.EndDateTime, DateTimeKind.Utc);

        eventToEdit.Title = newEventDto.Title;
        eventToEdit.StartDateTime = newStartDateTime;
        eventToEdit.EndDateTime = newEndDateTime;

        dbContext.SaveChanges();

        return new OkResult();
    }

    [HttpDelete]
    public IActionResult DeleteEvent(Guid id)
    {
        var eventToDelete = dbContext.CalendarEvents.Find(id);

        if (eventToDelete is null)
        {
            return new NotFoundResult();
        }

        dbContext.CalendarEvents.Remove(eventToDelete);
        dbContext.SaveChanges();

        return new NoContentResult();
    }
}
