using Microsoft.AspNetCore.Mvc;
using back.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]/[action]")]
public class CalendarController(ILogger<CalendarController> logger, TimeManagerDBContext dbContext) : ControllerBase
{
    private bool TryGetUserId(out string userId)
    {
        var sub = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        userId = String.Empty;

        if (sub is null || sub.Value is null)
        {
            logger.LogDebug("Request doesn't contain an access token with a valid subject value.");

            return false;
        }

        userId = sub.Value;

        return true;
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IEnumerable<CalendarEventModel>> Events()
    {
        if (!TryGetUserId(out var userId))
        {
            return new ForbidResult();
        }

        var userEvents = dbContext.CalendarEvents.Where(cEvent => cEvent.UserId == userId);

        return new JsonResult(userEvents);
    }

    [HttpPost]
    [Authorize]
    public ActionResult<CalendarEventModel> AddEvent([FromBody] NewEventDto newEventDto)
    {
        if (!TryGetUserId(out var userId))
        {
            return new ForbidResult();
        }

        if (!ModelState.IsValid)
        {
            return new BadRequestResult();
        }

        var startDateTime = DateTime.SpecifyKind(newEventDto.StartDateTime, DateTimeKind.Utc);
        var endDateTime = DateTime.SpecifyKind(newEventDto.EndDateTime, DateTimeKind.Utc);

        var newEvent = new CalendarEventModel()
        {
            Id = Guid.CreateVersion7(),
            UserId = userId,
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

        return new JsonResult(newEvent);
    }

    [HttpPut("{id}")]
    [Authorize]
    public IActionResult EditEvent([FromBody] NewEventDto newEventDto, Guid id)
    {
        if (!TryGetUserId(out var userId))
        {
            return new ForbidResult();
        }

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

        if (eventToEdit.UserId != userId)
        {
            return new ForbidResult();
        }

        var newStartDateTime = DateTime.SpecifyKind(newEventDto.StartDateTime, DateTimeKind.Utc);
        var newEndDateTime = DateTime.SpecifyKind(newEventDto.EndDateTime, DateTimeKind.Utc);

        eventToEdit.Title = newEventDto.Title;
        eventToEdit.StartDateTime = newStartDateTime;
        eventToEdit.EndDateTime = newEndDateTime;

        dbContext.SaveChanges();

        return new OkResult();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public IActionResult DeleteEvent(Guid id)
    {
        if (!TryGetUserId(out var userId))
        {
            return new ForbidResult();
        }

        var eventToDelete = dbContext.CalendarEvents.Find(id);

        if (eventToDelete is null)
        {
            return new NotFoundResult();
        }

        if (eventToDelete.UserId != userId)
        {
            return new ForbidResult();
        }

        dbContext.CalendarEvents.Remove(eventToDelete);
        dbContext.SaveChanges();

        return new NoContentResult();
    }
}
