using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using CarpoolApp.Server.Models;
using CarpoolApp.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
                var count = _context.Rides.Count();
                Console.WriteLine($"Total Rides in DB: {count}");

                var availableRides = _context.Rides
                    .Include(r => r.Driver)
                        .ThenInclude(d => d.User)
                    .Include(r => r.Vehicle)
                    .Where(r => r.Status == RideStatus.Scheduled && r.AvailableSeats > 0)
                    .AsEnumerable() // Ensures JSON deserialization happens in memory
                    .Select(r => new
                    {
                        r.RideId,
                        r.Origin,
                        r.Destination,
                        DepartureTime = r.DepartureTime,// ISO 8601 format
                        r.AvailableSeats,
                        r.PricePerSeat,
                        DriverName = r.Driver?.User?.FullName ?? "Unknown Driver",
                        VehicleModel = r.Vehicle?.Model ?? "Unknown Vehicle",
                        RouteStops = string.IsNullOrEmpty(r.RouteStops)
                            ? new List<string>() // Ensure it's not null
                            : JsonSerializer.Deserialize<List<string>>(r.RouteStops)
                    })
                    .ToList();

                if (availableRides.Any())
                {
                    var firstRide = availableRides.First();
                    Console.WriteLine($"RideId: {firstRide.RideId}, Origin: {firstRide.Origin}, Destination: {firstRide.Destination}, " +
                                      $"DepartureTime: {firstRide.DepartureTime}, AvailableSeats: {firstRide.AvailableSeats}, " +
                                      $"PricePerSeat: {firstRide.PricePerSeat}, DriverName: {firstRide.DriverName}, " +
                                      $"VehicleModel: {firstRide.VehicleModel}, RouteStops: {string.Join(", ", firstRide.RouteStops)}");
                }
                else
                {
                    Console.WriteLine("No available rides found.");
                }

                return Ok(availableRides);
            }
        }
}
