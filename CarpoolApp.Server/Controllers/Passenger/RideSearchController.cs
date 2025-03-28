using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using CarpoolApp.Server.Models;
using CarpoolApp.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System;

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
            {
                return BadRequest("Search term is required.");
            }

            var matchingRides = _context.Rides
                .Include(r => r.Driver)
                    .ThenInclude(d => d.User)
                .Include(r => r.Vehicle)
                .Where(r => r.Status == RideStatus.Scheduled
                            && r.AvailableSeats > 0
                            && (r.Origin.Contains(query)
                                || r.Destination.Contains(query)
                                || (r.RouteStops != null && r.RouteStops.Contains(query)))) // ✅ Filtering RouteStops at DB level
                .AsEnumerable() // Ensure JSON deserialization occurs in-memory
                .Select(r => new
                {
                    r.RideId,
                    r.Origin,
                    r.Destination,
                    DepartureTime = r.DepartureTime.ToString("o"), // ISO 8601 format
                    r.AvailableSeats,
                    r.PricePerSeat,
                    DriverName = r.Driver?.User?.FullName ?? "Unknown Driver",
                    VehicleModel = r.Vehicle?.Model ?? "Unknown Vehicle",
                    RouteStops = string.IsNullOrEmpty(r.RouteStops)
                        ? new List<string>() // Ensure it's not null
                        : JsonSerializer.Deserialize<List<string>>(r.RouteStops)
                })
                .ToList();

            if (!matchingRides.Any())
            {
                return NotFound("No rides found for the given search term.");
            }

            return Ok(matchingRides);
        }
    }
}
