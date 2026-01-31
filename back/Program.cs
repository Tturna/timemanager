using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
var connectionString = builder.Configuration.GetValue<string>("ConnectionString");
builder.Services.AddNpgsql<TimeManagerDBContext>(connectionString);

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(corsOptions =>
    {
        corsOptions.AddPolicy("devAllowAll", policyBuilder =>
        {
            policyBuilder.AllowAnyOrigin();
            policyBuilder.AllowAnyHeader();
            policyBuilder.AllowAnyMethod();
        });
    });
}

builder.Services.AddOpenApi();

builder.Services.AddAuthentication().AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.RequireHttpsMetadata = false;
    }

    options.Authority = builder.Configuration["Authentication:Authority"];
    options.Audience = builder.Configuration["Authentication:Audience"];
    options.MetadataAddress = builder.Configuration["Authentication:MetadataAddress"]
        ?? throw new ArgumentNullException(
            "MetadataAddress",
            "Failed to set up JWT authentication. Authentication:MetadataAddress missing from configuration.");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["Authentication:ValidIssuer"],
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogInformation(
                context.Exception,
                "JWT authentication failed. Path: {Path}",
                context.HttpContext.Request.Path
            );

            return Task.CompletedTask;
        }
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

if (app.Environment.IsDevelopment())
{
    app.UseCors("devAllowAll");
}

app.UseAuthentication();
app.UseAuthorization();

// Map attribute-routed controllers
app.MapControllers();
app.MapOpenApi();

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
