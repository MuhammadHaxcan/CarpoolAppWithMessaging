using CarpoolApp.Server.Data;
using CarpoolApp.Server.DTO;
using CarpoolApp.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace CarpoolApp.Server.Controllers.Driver
{
    [Authorize(Roles = "driver")]
    [Route("api/[controller]")]
    [ApiController]
    public class RideManagementController : ControllerBase
    {
        private readonly CarpoolDbContext _context;

        public RideManagementController(CarpoolDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateRide([FromBody] CreateRideDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver == null)
                return NotFound("Driver not found.");

            var vehicle = await _context.Vehicles
                .FirstOrDefaultAsync(v => v.VehicleId == dto.VehicleId && v.DriverId == driver.DriverId);
            if (vehicle == null)
                return BadRequest("Invalid vehicle selection.");

            var ride = new Ride
            {
                Origin = dto.Origin,
                Destination = dto.Destination,
                RouteStops = JsonSerializer.Serialize(dto.RouteStops),
                DepartureTime = dto.DepartureTime.ToUniversalTime(),
                VehicleId = dto.VehicleId,

                DriverId = driver.DriverId,
                AvailableSeats = dto.AvailableSeats,
                PricePerSeat = dto.PricePerSeat, 
            };

            _context.Rides.Add(ride);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Ride created successfully." });
        }
    }
}
