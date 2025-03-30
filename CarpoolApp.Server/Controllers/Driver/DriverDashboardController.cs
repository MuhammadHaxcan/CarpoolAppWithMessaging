using CarpoolApp.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CarpoolApp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

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


    [HttpGet("rides-with-requests")]
    public async Task<IActionResult> GetRidesWithRequests()
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var driver = await _context.Drivers
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (driver == null)
                return NotFound("Driver not found.");

            var rides = await _context.Rides
                .Where(r => r.DriverId == driver.DriverId)
                .Include(r => r.Vehicle)
                .OrderByDescending(r => r.DepartureTime)
                .ToListAsync();

            var result = new List<object>();

            foreach (var ride in rides)
            {
                var requests = await _context.RideRequests
                    .Where(r => r.RideId == ride.RideId && r.Status == RideRequestStatus.Pending)
                    .Include(r => r.Passenger)
                        .ThenInclude(p => p.User)
                    .Select(r => new
                    {
                        requestId = r.RideRequestId,
                        pickupLocation = r.PickupLocation,
                        dropoffLocation = r.DropoffLocation,
                        passengerName = r.Passenger.User.FullName
                    })
                    .ToListAsync();

                result.Add(new
                {
                    rideId = ride.RideId,
                    origin = ride.Origin,
                    destination = ride.Destination,
                    departureTime = ride.DepartureTime,
                    availableSeats = ride.AvailableSeats,
                    pricePerSeat = ride.PricePerSeat,
                    vehicle = $"{ride.Vehicle?.Make} {ride.Vehicle?.Model}",
                    requests = requests
                });
            }

            return Ok(new
            {
                timestamp = DateTime.UtcNow,
                result
            }
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}