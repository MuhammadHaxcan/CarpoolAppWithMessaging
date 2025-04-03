using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using CarpoolApp.Server.Models;
using CarpoolApp.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Security.Claims;

namespace CarpoolApp.Server.Controllers.Passenger
{
    [Authorize(Roles = "passenger")]
    [Route("api/[controller]")]
    [ApiController]
    public class PassengerDashboardController : ControllerBase
    {
        private readonly CarpoolDbContext _context;

        public PassengerDashboardController(CarpoolDbContext context)
        {
            _context = context;
        }

        [HttpGet("available-rides")]
        public IActionResult GetAvailableRides()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("Invalid passenger credentials.");

            var passenger = _context.Passengers.FirstOrDefault(p => p.UserId == int.Parse(userId));
            if (passenger == null)
                return NotFound("Passenger record not found.");

            var availableRides = _context.Rides
                .Include(r => r.Driver)
                    .ThenInclude(d => d.User)
                .Include(r => r.Vehicle)
                .Where(r => r.Status == RideStatus.Scheduled && r.AvailableSeats > 0)
                .AsEnumerable()
                .Select(r => new
                {
                    r.RideId,
                    r.Origin,
                    r.Destination,
                    DepartureTime = r.DepartureTime,
                    r.AvailableSeats,
                    r.PricePerSeat,
                    DriverName = r.Driver?.User?.FullName ?? "Unknown Driver",
                    VehicleModel = r.Vehicle?.Model ?? "Unknown Vehicle",
                    RouteStops = string.IsNullOrEmpty(r.RouteStops)
                        ? new List<string>()
                        : JsonSerializer.Deserialize<List<string>>(r.RouteStops),
                    RideRequestStatus = _context.RideRequests
                        .Where(rr => rr.RideId == r.RideId && rr.PassengerId == passenger.PassengerId)
                        .Select(rr => rr.Status.ToString())
                        .FirstOrDefault() ?? "Not Requested"
                })
                .ToList();

            return Ok(availableRides);
        }

        [HttpGet("accepted-rides")]
        public IActionResult GetAcceptedRides()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("Invalid passenger credentials.");

            var passenger = _context.Passengers.FirstOrDefault(p => p.UserId == int.Parse(userId));
            if (passenger == null)
                return NotFound("Passenger record not found.");

            var acceptedRides = _context.Rides
                .Include(r => r.Driver)
                    .ThenInclude(d => d.User)
                .Include(r => r.Vehicle)
                .Where(r => _context.RideRequests.Any(rr => rr.RideId == r.RideId
                                                            && rr.PassengerId == passenger.PassengerId
                                                            && rr.Status == RideRequestStatus.Accepted))
                .AsEnumerable()
                .Select(r => new
                {
                    r.RideId,
                    r.Origin,
                    r.Destination,
                    DepartureTime = r.DepartureTime,
                    r.AvailableSeats,
                    r.PricePerSeat,
                    DriverName = r.Driver?.User?.FullName ?? "Unknown Driver",
                    VehicleModel = r.Vehicle?.Model ?? "Unknown Vehicle",
                    RouteStops = string.IsNullOrEmpty(r.RouteStops)
                        ? new List<string>()
                        : JsonSerializer.Deserialize<List<string>>(r.RouteStops),
                })
                .ToList();

            return Ok(acceptedRides);
        }

    }
}