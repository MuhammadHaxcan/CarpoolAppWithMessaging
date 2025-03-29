using CarpoolApp.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CarpoolApp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = "driver")]
[Route("api/[controller]")]
[ApiController]
public class DriverDashboardController : ControllerBase
{
    private readonly CarpoolDbContext _context;

    public DriverDashboardController(CarpoolDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var driver = await _context.Drivers
            .Include(d => d.Rides)
            .FirstOrDefaultAsync(d => d.UserId == userId);

        if (driver == null)
            return NotFound("Driver not found.");

        var currentRide = await _context.Rides
            .Where(r => r.DriverId == driver.DriverId && r.Status == RideStatus.Scheduled)
            .OrderByDescending(r => r.DepartureTime)
            .Select(r => new
            {
                r.RideId,
                r.Origin,
                r.Destination,
                r.DepartureTime,
                r.AvailableSeats,
                r.PricePerSeat,
                r.Vehicle.Make,
                r.Vehicle.Model,
                r.Vehicle.NumberPlate,
            })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            message = "Welcome to the Driver Dashboard!",
            timestamp = DateTime.UtcNow,
            currentRide
        });
    }
}