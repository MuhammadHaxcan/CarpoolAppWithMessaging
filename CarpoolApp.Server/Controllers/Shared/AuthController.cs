using Microsoft.AspNetCore.Mvc;
using CarpoolApp.Server.Models;
using CarpoolApp.Server.DTO;
using Microsoft.EntityFrameworkCore;
using CarpoolApp.Server.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Data;

namespace CarpoolApp.Server.Controllers.Shared
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CarpoolDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(CarpoolDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.UniversityEmail == dto.UniversityEmail))
                return BadRequest(new { success = false, message = "Email already exists." });

            var hasher = new PasswordHasher<User>();

            var user = new User
            {
                FullName = dto.FullName,
                UniversityEmail = dto.UniversityEmail,
                PhoneNumber = dto.PhoneNumber,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = hasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Driver)
                .Include(u => u.Passenger)
                .FirstOrDefaultAsync(u => u.UniversityEmail == dto.UniversityEmail);

            if (user == null)
                return Unauthorized(new { success = false, message = "Invalid email or password." });

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);

            if (result != PasswordVerificationResult.Success)
                return Unauthorized(new { success = false, message = "Invalid email or password." });

            // Handle role-based creation
            if (dto.Role.ToLower() == "driver" && user.Driver == null)
            {
                _context.Drivers.Add(new Models.Driver { UserId = user.UserId });
                await _context.SaveChangesAsync();
            }
            else if (dto.Role.ToLower() == "passenger" && user.Passenger == null)
            {
                _context.Passengers.Add(new Models.Passenger{ UserId = user.UserId });
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user, dto.Role.ToLower());

            Console.WriteLine();

            return Ok(new
            {
                success = true,
                message = "Login successful.",
                token,
                userId = user.UserId,
                role = dto.Role
            });

        }
        private string GenerateJwtToken(User user, string role)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.UniversityEmail),
            new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
