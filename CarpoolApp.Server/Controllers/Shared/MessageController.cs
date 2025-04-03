using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CarpoolApp.Server.Hubs;
using CarpoolApp.Server.Data;
using CarpoolApp.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Security.Claims;

namespace CarpoolApp.Server.Controllers.Shared
{
    [Route("api/messages")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly CarpoolDbContext _context;

        public MessageController(IHubContext<ChatHub> hubContext, CarpoolDbContext context)
        {
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] MessageRequest request)
        {
            try
            {
                // Extract userId from claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    Console.WriteLine("Unauthorized: User ID not found in claims.");
                    return Unauthorized("User ID not found in claims.");
                }

                Console.WriteLine($"Received message from UserId: {userId}, RideId: {request.RideId}, Content: {request.Content}");

                if (!request.RideId.HasValue)
                {
                    return BadRequest("Ride ID is required.");
                }

                int rideId = request.RideId.Value;

                // Retrieve passenger and driver along with User information
                var passenger = await _context.Passengers
                    .Include(p => p.User)  // Include User
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                var driver = await _context.Drivers
                    .Include(d => d.User)  // Include User
                    .FirstOrDefaultAsync(d => d.UserId == userId);

                int senderId;
                string senderName = string.Empty;  // Declare senderName variable

                if (passenger != null && passenger.User != null)
                {
                    senderId = passenger.PassengerId;
                    senderName = passenger.User.FullName;  // Assuming passenger has a 'FullName' property in User model
                    Console.WriteLine($"User is a Passenger with ID: {senderId}, Name: {senderName}");
                }
                else if (driver != null && driver.User != null)
                {
                    senderId = driver.DriverId;
                    senderName = driver.User.FullName;  // Assuming driver has a 'FullName' property in User model
                    Console.WriteLine($"User is a Driver with ID: {senderId}, Name: {senderName}");
                }
                else
                {
                    return NotFound("User is neither a passenger nor a driver, or User information is missing.");
                }

                // Find or create conversation
                var conversation = await _context.Conversations
                    .Include(c => c.Members)
                    .FirstOrDefaultAsync(c => c.RideId == rideId);

                if (conversation == null)
                {
                    conversation = new Conversation
                    {
                        RideId = rideId,
                        CreatedAt = DateTime.UtcNow,
                        Members = new List<ConversationMember> { new ConversationMember { UserId = userId } }
                    };
                    _context.Conversations.Add(conversation);
                    await _context.SaveChangesAsync();
                }

                // Save message
                var message = new Message
                {
                    SenderId = senderId,
                    Content = request.Content,
                    ConversationId = conversation.ConversationId,
                    SentAt = DateTime.UtcNow
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                // Broadcast message to SignalR group
                await _hubContext.Clients.Group(conversation.ConversationId.ToString())
                    .SendAsync("ReceiveMessage", senderId, senderName, request.Content);  // Now senderName is defined

                return Ok(new { success = true, message = "Message sent successfully!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending message: {ex.Message}");
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }


        [HttpGet("conversation/{rideId}")]
        public async Task<IActionResult> GetMessages(int rideId)
        {
            try
            {
                // Extract userId from claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var userRoleClaim = User.FindFirstValue(ClaimTypes.Role);

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    Console.WriteLine("Unauthorized: User ID not found in claims.");
                    return Unauthorized("User ID not found in claims.");
                }

                if (string.IsNullOrEmpty(userRoleClaim))
                {
                    Console.WriteLine("Unauthorized: User role not found in claims.");
                    return Unauthorized("User role not found in claims.");
                }

                Console.WriteLine($"Fetching messages for Ride ID: {rideId}, requested by User ID: {userId}, Role: {userRoleClaim}");

                int? associatedId = null; // Will hold either PassengerId or DriverId

                // Determine if the user is a Passenger or a Driver
                if (userRoleClaim == "passenger")
                {
                    var passenger = await _context.Passengers.FirstOrDefaultAsync(p => p.UserId == userId);
                    if (passenger != null)
                    {
                        associatedId = passenger.PassengerId;
                        Console.WriteLine($"User is a Passenger with ID: {associatedId}");
                    }
                }
                else if (userRoleClaim == "driver")
                {
                    var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
                    if (driver != null)
                    {
                        associatedId = driver.DriverId;
                        Console.WriteLine($"User is a Driver with ID: {associatedId}");
                    }
                }

                if (associatedId == null)
                {
                    return NotFound("User is neither a registered passenger nor a driver.");
                }

                // Find the conversation for the given Ride ID
                var conversation = await _context.Conversations
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.RideId == rideId);

                if (conversation == null)
                {
                    return NotFound("No conversation found for this ride.");
                }

                // Fetch and return messages with sender names
                var messages = conversation.Messages
                    .OrderBy(m => m.SentAt)
                    .Select(m => new
                    {
                        SenderId = m.SenderId,
                        SenderName = (from p in _context.Passengers
                                      where p.PassengerId == m.SenderId
                                      select p.User.FullName)
                                     .Union(from d in _context.Drivers
                                            where d.DriverId == m.SenderId
                                            select d.User.FullName)
                                     .FirstOrDefault(), // Get sender's Full Name
                        Content = m.Content,
                        SentAt = m.SentAt
                    })
                    .ToList();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching messages: {ex.Message}");
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }



    }

    // DTO class to represent the message request body
    public class MessageRequest
    {
        public string SenderId { get; set; }
        public string? Content { get; set; } // Nullable content
        public string? ConversationId { get; set; } // Nullable conversationId
        public int? RideId { get; set; } // Nullable RideId

    }
}
