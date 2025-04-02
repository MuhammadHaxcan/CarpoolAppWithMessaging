using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using CarpoolApp.Server.Models;
using CarpoolApp.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using CarpoolApp.Server.DTO;

namespace CarpoolApp.Server.Controllers.Passenger
{
    [Authorize(Roles = "passenger")]
    [Route("api/[controller]")]
    [ApiController]
    public class RideSearchController : ControllerBase
    {
        private readonly CarpoolDbContext _context;

        public RideSearchController(CarpoolDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public IActionResult SearchRides([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search term is required.");

            query = query.Trim().ToLower();

            var matchingRides = _context.Rides
                .Include(r => r.Driver)
                    .ThenInclude(d => d.User)
                .Include(r => r.Vehicle)
                .Where(r => r.Status == RideStatus.Scheduled && r.AvailableSeats > 0)
                .AsEnumerable()
                .Where(r =>
                    r.Origin.ToLower().Contains(query) ||
                    r.Destination.ToLower().Contains(query) ||
                    (r.RouteStops != null && JsonSerializer.Deserialize<List<string>>(r.RouteStops)?
                        .Any(stop => stop.ToLower().Contains(query)) == true)
                )
                .Select(r => new RideSearchResultDto
                {
                    RideId = r.RideId,
                    Origin = r.Origin,
                    Destination = r.Destination,
                    DepartureTime = r.DepartureTime.ToString("o"),
                    AvailableSeats = r.AvailableSeats,
                    PricePerSeat = r.PricePerSeat,
                    DriverName = r.Driver?.User?.FullName ?? "Unknown Driver",
                    VehicleModel = r.Vehicle?.Model ?? "Unknown Vehicle",
                    RouteStops = string.IsNullOrEmpty(r.RouteStops)
                        ? new List<string>()
                        : JsonSerializer.Deserialize<List<string>>(r.RouteStops)
                })
                .ToList();

            if (!matchingRides.Any())
                return NotFound("No rides found for the given search term.");

            return Ok(matchingRides);
        }
    }
}