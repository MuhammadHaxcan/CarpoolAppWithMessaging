using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CarpoolApp.Server.Data;
using CarpoolApp.Server.Models;

namespace CarpoolApp.Server.Controllers.Driver
{
    [Route("api/riderequest")]
    [ApiController]
    //[Authorize(Roles = "driver")]
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
            Console.WriteLine($"Received Accept Request for ID: {requestId}");

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                Console.WriteLine("User ID claim not found.");
                return Unauthorized(new { message = "User not authenticated" });
            }

            int userId = int.Parse(userIdClaim);
            Console.WriteLine($"User ID: {userId}");

            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver == null)
            {
                Console.WriteLine("Driver not found for User ID: " + userId);
                return NotFound(new { message = "Driver not found" });
            }

            int driverId = driver.DriverId;
            Console.WriteLine($"Driver ID: {driverId}");

            var rideRequest = await _context.RideRequests
                .Include(r => r.Ride)
                .FirstOrDefaultAsync(r => r.RideRequestId == requestId && r.Ride.DriverId == driverId);

            if (rideRequest == null)
            {
                Console.WriteLine($"Ride request not found for ID: {requestId} and {driverId}");
                return NotFound("Ride request not found or unauthorized.");
            }

            rideRequest.Status = RideRequestStatus.Accepted;
            await _context.SaveChangesAsync();

            Console.WriteLine($"Ride request {requestId} accepted.");
            return Ok(new { message = "Ride request accepted." });
        }


        [HttpPost("reject/{requestId}")]
        public async Task<IActionResult> RejectRideRequest(int requestId)
        {
            Console.WriteLine($"Received Reject Request for ID: {requestId}");

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                Console.WriteLine("User ID claim not found.");
                return Unauthorized(new { message = "User not authenticated" });
            }

            int userId = int.Parse(userIdClaim);
            Console.WriteLine($"User ID: {userId}");

            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver == null)
            {
                Console.WriteLine("Driver not found for User ID: " + userId);
                return NotFound(new { message = "Driver not found" });
            }

            int driverId = driver.DriverId;
            Console.WriteLine($"Driver ID: {driverId}");

            var rideRequest = await _context.RideRequests
                .Include(r => r.Ride)
                .FirstOrDefaultAsync(r => r.RideRequestId == requestId && r.Ride.DriverId == driverId);

            if (rideRequest == null)
            {
                Console.WriteLine($"Ride request not found for ID: {requestId} and {driverId}");
                return NotFound("Ride request not found or unauthorized.");
            }

            rideRequest.Status = RideRequestStatus.Denied;
            await _context.SaveChangesAsync();

            Console.WriteLine($"Ride request {requestId} rejected.");
            return Ok(new { message = "Ride request rejected." });
        }


    }
}
