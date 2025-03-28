﻿// <auto-generated />
using System;
using CarpoolApp.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace CarpoolApp.Server.Migrations
{
    [DbContext(typeof(CarpoolDbContext))]
    [Migration("20250328232635_updatelengthroutestop")]
    partial class updatelengthroutestop
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("CarpoolApp.Server.Models.Conversation", b =>
                {
                    b.Property<int>("ConversationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ConversationId"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<int?>("RideId")
                        .HasColumnType("int");

                    b.HasKey("ConversationId");

                    b.HasIndex("RideId");

                    b.ToTable("Conversations");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.ConversationMember", b =>
                {
                    b.Property<int>("ConversationId")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("ConversationId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("ConversationMembers");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Driver", b =>
                {
                    b.Property<int>("DriverId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("DriverId"));

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("DriverId");

                    b.HasIndex("UserId")
                        .IsUnique();

                    b.ToTable("Drivers");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Message", b =>
                {
                    b.Property<int>("MessageId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("MessageId"));

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("nvarchar(1000)");

                    b.Property<int>("ConversationId")
                        .HasColumnType("int");

                    b.Property<int>("SenderId")
                        .HasColumnType("int");

                    b.Property<DateTime>("SentAt")
                        .HasColumnType("datetime2");

                    b.HasKey("MessageId");

                    b.HasIndex("ConversationId");

                    b.HasIndex("SenderId");

                    b.ToTable("Messages");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Notification", b =>
                {
                    b.Property<int>("NotificationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("NotificationId"));

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<DateTime>("SentAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("NotificationId");

                    b.HasIndex("UserId");

                    b.ToTable("Notifications");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Passenger", b =>
                {
                    b.Property<int>("PassengerId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PassengerId"));

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("PassengerId");

                    b.HasIndex("UserId")
                        .IsUnique();

                    b.ToTable("Passengers");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Ride", b =>
                {
                    b.Property<int>("RideId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("RideId"));

                    b.Property<int>("AvailableSeats")
                        .HasColumnType("int");

                    b.Property<DateTime>("DepartureTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Destination")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<int>("DriverId")
                        .HasColumnType("int");

                    b.Property<string>("Origin")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<int>("PricePerSeat")
                        .HasColumnType("int");

                    b.Property<string>("RouteStops")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("VehicleId")
                        .HasColumnType("int");

                    b.HasKey("RideId");

                    b.HasIndex("DriverId");

                    b.HasIndex("VehicleId");

                    b.ToTable("Rides");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.RideRequest", b =>
                {
                    b.Property<int>("RideRequestId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("RideRequestId"));

                    b.Property<string>("DropoffLocation")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<int>("PassengerId")
                        .HasColumnType("int");

                    b.Property<string>("PickupLocation")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<DateTime>("RequestedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("RideId")
                        .HasColumnType("int");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("RideRequestId");

                    b.HasIndex("PassengerId");

                    b.HasIndex("RideId");

                    b.ToTable("RideRequests");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserId"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("FullName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UniversityEmail")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId");

                    b.HasIndex("UniversityEmail")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Vehicle", b =>
                {
                    b.Property<int>("VehicleId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("VehicleId"));

                    b.Property<int>("DriverId")
                        .HasColumnType("int");

                    b.Property<string>("Make")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("nvarchar(10)");

                    b.Property<string>("Model")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("nvarchar(10)");

                    b.Property<string>("NumberPlate")
                        .IsRequired()
                        .HasMaxLength(7)
                        .HasColumnType("nvarchar(7)");

                    b.HasKey("VehicleId");

                    b.HasIndex("DriverId");

                    b.HasIndex("NumberPlate")
                        .IsUnique();

                    b.ToTable("Vehicles");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Conversation", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.Ride", "Ride")
                        .WithMany()
                        .HasForeignKey("RideId");

                    b.Navigation("Ride");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.ConversationMember", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.Conversation", "Conversation")
                        .WithMany("Members")
                        .HasForeignKey("ConversationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("CarpoolApp.Server.Models.User", "User")
                        .WithMany("ConversationMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Conversation");

                    b.Navigation("User");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Driver", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.User", "User")
                        .WithOne("Driver")
                        .HasForeignKey("CarpoolApp.Server.Models.Driver", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Message", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.Conversation", "Conversation")
                        .WithMany("Messages")
                        .HasForeignKey("ConversationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("CarpoolApp.Server.Models.User", "Sender")
                        .WithMany("Messages")
                        .HasForeignKey("SenderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Conversation");

                    b.Navigation("Sender");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Notification", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.User", "User")
                        .WithMany("Notifications")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Passenger", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.User", "User")
                        .WithOne("Passenger")
                        .HasForeignKey("CarpoolApp.Server.Models.Passenger", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Ride", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.Driver", "Driver")
                        .WithMany("Rides")
                        .HasForeignKey("DriverId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("CarpoolApp.Server.Models.Vehicle", "Vehicle")
                        .WithMany("Rides")
                        .HasForeignKey("VehicleId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Driver");

                    b.Navigation("Vehicle");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.RideRequest", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.Passenger", "Passenger")
                        .WithMany("RideRequests")
                        .HasForeignKey("PassengerId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("CarpoolApp.Server.Models.Ride", "Ride")
                        .WithMany("RideRequests")
                        .HasForeignKey("RideId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Passenger");

                    b.Navigation("Ride");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Vehicle", b =>
                {
                    b.HasOne("CarpoolApp.Server.Models.Driver", "Driver")
                        .WithMany("Vehicles")
                        .HasForeignKey("DriverId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Driver");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Conversation", b =>
                {
                    b.Navigation("Members");

                    b.Navigation("Messages");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Driver", b =>
                {
                    b.Navigation("Rides");

                    b.Navigation("Vehicles");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Passenger", b =>
                {
                    b.Navigation("RideRequests");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Ride", b =>
                {
                    b.Navigation("RideRequests");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.User", b =>
                {
                    b.Navigation("ConversationMembers");

                    b.Navigation("Driver");

                    b.Navigation("Messages");

                    b.Navigation("Notifications");

                    b.Navigation("Passenger");
                });

            modelBuilder.Entity("CarpoolApp.Server.Models.Vehicle", b =>
                {
                    b.Navigation("Rides");
                });
#pragma warning restore 612, 618
        }
    }
}
