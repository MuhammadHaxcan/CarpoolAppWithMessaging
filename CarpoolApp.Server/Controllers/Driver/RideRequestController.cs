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

        [HttpGet("incoming-requests")]
        public async Task<IActionResult> GetIncomingRequests()
        {
            try
            {
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

                var rideIds = await _context.Rides
                    .Where(r => r.DriverId == driverId)
                    .Select(r => r.RideId)
                    .ToListAsync();

                if (rideIds.Count == 0)
                {
                    Console.WriteLine("No rides found for Driver ID: " + driverId);
                    return Ok(new { message = "No active rides found for this driver" });
                }

                Console.WriteLine($"Found {rideIds.Count} ride(s) for Driver ID {driverId}");

                var rideRequests = await _context.RideRequests
                    .Include(r => r.Passenger)
                        .ThenInclude(p => p.User)
                    .Where(r => rideIds.Contains(r.RideId) && r.Status == RideRequestStatus.Pending)
                    .Select(r => new
                    {
                        requestId = r.RideRequestId,
                        pickupLocation = r.PickupLocation,
                        dropoffLocation = r.DropoffLocation,
                        passengerName = r.Passenger.User.FullName
                    })
                    .ToListAsync();

                Console.WriteLine($"Total Pending Requests Found: {rideRequests.Count}");
                foreach (var request in rideRequests)
                {
                    Console.WriteLine($"RequestId: {request.requestId}, Pickup: {request.pickupLocation}, Dropoff: {request.dropoffLocation}, Passenger: {request.passengerName}");
                }

                return Ok(rideRequests);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetIncomingRequests: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
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
