using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CarpoolApp.Server.Data;
using CarpoolApp.Server.Models;

namespace CarpoolApp.Server.Controllers.Driver
{
    [Route("api/riderequest")]
    [ApiController]
    [Authorize(Roles = "driver")]
    public class RideRequestController : ControllerBase
    {
        private readonly CarpoolDbContext _context;

        public RideRequestController(CarpoolDbContext context)
        {
            _context = context;
        }

        [HttpPost("accept/{requestId}")]
        public async Task<IActionResult> AcceptRideRequest(int requestId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            int userId = int.Parse(userIdClaim);

            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver == null)
            {
                return NotFound(new { message = "Driver not found" });
            }

            int driverId = driver.DriverId;

            var rideRequest = await _context.RideRequests
                .Include(r => r.Ride)
                .FirstOrDefaultAsync(r => r.RideRequestId == requestId && r.Ride.DriverId == driverId);

            if (rideRequest == null)
            {
                return NotFound("Ride request not found or unauthorized.");
            }

            rideRequest.Status = RideRequestStatus.Accepted;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ride request accepted." });
        }

        [HttpPost("reject/{requestId}")]
        public async Task<IActionResult> RejectRideRequest(int requestId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            int userId = int.Parse(userIdClaim);

            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver == null)
            {
                return NotFound(new { message = "Driver not found" });
            }

            int driverId = driver.DriverId;

            var rideRequest = await _context.RideRequests
                .Include(r => r.Ride)
                .FirstOrDefaultAsync(r => r.RideRequestId == requestId && r.Ride.DriverId == driverId);

            if (rideRequest == null)
            {
                return NotFound("Ride request not found or unauthorized.");
            }

            rideRequest.Status = RideRequestStatus.Denied;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ride request rejected." });
        }
    }
}