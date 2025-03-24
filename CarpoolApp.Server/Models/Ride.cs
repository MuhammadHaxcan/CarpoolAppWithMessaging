﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarpoolApp.Server.Models
{
    public class Ride
    {
        public int RideId { get; set; } 

        [Required(ErrorMessage = "Origin is required.")]
        [StringLength(100, ErrorMessage = "Origin cannot exceed 100 characters.")]
        public string Origin { get; set; }

        [Required(ErrorMessage = "Destination is required.")]
        [StringLength(100, ErrorMessage = "Destination cannot exceed 100 characters.")]
        public string Destination { get; set; }

        public RideStatus Status { get; set; } = RideStatus.Scheduled;

        [MaxLength(10, ErrorMessage = "A maximum of 10 route stops is allowed.")]
        public List<string> RouteStops { get; set; } = new List<string>();

        [Required(ErrorMessage = "Departure time is required.")]
        public DateTime DepartureTime { get; set; }

        [Required(ErrorMessage = "Available seats are required.")]
        [Range(1, 10, ErrorMessage = "Available seats must be between 1 and 10.")]
        public int AvailableSeats { get; set; }

        [Required(ErrorMessage = "Price per seat is required.")]
        [Range(0.01, 1000.00, ErrorMessage = "Price per seat must be between 0.01 and 1000.00.")]
        public decimal PricePerSeat { get; set; }

        [Required(ErrorMessage = "Driver ID is required.")]
        public int DriverId { get; set; }

        public Driver Driver { get; set; }

        [Required(ErrorMessage = "Vehicle ID is required.")]
        public int VehicleId { get; set; }

        public Vehicle Vehicle { get; set; }

        public ICollection<RideRequest> RideRequests { get; set; } = new List<RideRequest>();
    }

    public enum RideStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Canceled
    }


}
