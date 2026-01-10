using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
var connectionString = builder.Configuration.GetValue<string>("ConnectionString");
builder.Services.AddNpgsql<TimeManagerDBContext>(connectionString);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "api/{controller}/{action}/{id?}");

using (var scope = app.Services.CreateScope())
{
    app.Logger.LogInformation("Running initial database migration...");
    var dbContext = scope.ServiceProvider.GetRequiredService<TimeManagerDBContext>();

    try
    {
        dbContext.Database.Migrate();
    }
    catch (Npgsql.NpgsqlException ex)
    {
        app.Logger.LogCritical(ex, "Database migration failed during startup!");
        throw;
    }

    app.Logger.LogInformation("Initial database migration complete.");
}

app.Run();
