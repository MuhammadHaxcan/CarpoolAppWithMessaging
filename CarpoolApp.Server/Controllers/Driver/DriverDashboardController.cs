using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CarpoolApp.Server.Controllers.Driver
{
    [Authorize(Roles = "driver")]
    [Route("api/[controller]")]
    [ApiController]
    public class DriverDashboardController : ControllerBase
    {

        [HttpGet]
        public IActionResult GetDashboard()
        {
            return Ok(new
            {
                message = "Welcome to the Driver Dashboard!",
                timestamp = DateTime.UtcNow
            });
        }
        
    }
}
