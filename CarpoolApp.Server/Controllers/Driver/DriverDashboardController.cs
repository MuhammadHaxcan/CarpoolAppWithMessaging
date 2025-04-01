using CarpoolApp.Server.Data;
using CarpoolApp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var ridesWithRequests = await _context.Rides
                .Where(r => r.Driver.UserId == userId)
                .Select(r => new
                {
                    rideId = r.RideId,
                    origin = r.Origin,
                    destination = r.Destination,
                    departureTime = r.DepartureTime,
                    availableSeats = r.AvailableSeats,
                    pricePerSeat = r.PricePerSeat,
                    vehicle = $"{r.Vehicle.Make} {r.Vehicle.Model}",
                    requests = r.RideRequests
                        .Where(req => req.Status == RideRequestStatus.Pending)
                        .Select(req => new
                        {
                            requestId = req.RideRequestId,
                            pickupLocation = req.PickupLocation,
                            dropoffLocation = req.DropoffLocation,
                            passengerName = req.Passenger.User.FullName
                        })
                        .ToList()
                })
                .OrderByDescending(r => r.departureTime)
                .AsSplitQuery() 
                .ToListAsync();

            return Ok(new
            {
                timestamp = DateTime.UtcNow,
                result = ridesWithRequests
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}