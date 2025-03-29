using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CarpoolApp.Server.Data;
using CarpoolApp.Server.Models;
using System.Security.Claims;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using CarpoolApp.Server.DTO;

namespace CarpoolApp.Server.Controllers.Passenger
{
    [Authorize(Roles = "passenger")]
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly CarpoolDbContext _context;

        public BookingController(CarpoolDbContext context)
        {
            _context = context;
        }

        [HttpPost("request-ride")]
        public async Task<IActionResult> RequestRide([FromBody] RideRequestDto requestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get the userId from Claims
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized("Invalid passenger credentials.");
            }

            // Get the passengerId using userId
            var passenger = await _context.Passengers.FirstOrDefaultAsync(p => p.UserId == int.Parse(userId));
            if (passenger == null)
            {
                return NotFound("Passenger record not found.");
            }

            var ride = await _context.Rides.FindAsync(requestDto.RideId);
            if (ride == null)
            {
                return NotFound("Ride not found.");
            }

            var existingRequest = await _context.RideRequests.FirstOrDefaultAsync(r => r.PassengerId == passenger.PassengerId && r.RideId == requestDto.RideId);
            if (existingRequest != null)
            {
                return BadRequest("You have already requested this ride.");
            }

            var rideRequest = new RideRequest
            {
                PickupLocation = requestDto.PickupLocation,
                DropoffLocation = requestDto.DropoffLocation,
                PassengerId = passenger.PassengerId, // Using PassengerId from DB
                RideId = requestDto.RideId,
                Status = RideRequestStatus.Pending,
                RequestedAt = DateTime.UtcNow
            };

            _context.RideRequests.Add(rideRequest);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Ride request sent successfully!" });
        }

    }
}
