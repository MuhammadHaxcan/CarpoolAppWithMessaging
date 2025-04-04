using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace CarpoolApp.Server.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string conversationId, int senderId, string message)
        {
            Console.WriteLine($"Received message in conversation {conversationId} from sender {senderId}: {message}");

            if (string.IsNullOrEmpty(conversationId))
            {
                Console.WriteLine("Error: conversationId is null or empty.");
                throw new ArgumentException("conversationId cannot be null.");
            }

            if (senderId <= 0)
            {
                Console.WriteLine("Error: Invalid senderId.");
                throw new ArgumentException("Invalid senderId.");
            }

            if (string.IsNullOrEmpty(message))
            {
                Console.WriteLine("Error: Message content is empty.");
                throw new ArgumentException("Message cannot be empty.");
            }

            // Send message to the conversation group including the timestamp.
            var sentAt = DateTime.UtcNow;

            // Ensure you are adding the client to the correct group and the group is valid
            await Clients.Group(conversationId).SendAsync("ReceiveMessage", senderId, message, sentAt);
        }


        public async Task JoinConversation(string conversationId)
        {
            Console.WriteLine($"Client {Context.ConnectionId} joining conversation {conversationId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        }


        public async Task LeaveConversation(string conversationId)
        {
            Console.WriteLine($"Client {Context.ConnectionId} leaving conversation {conversationId}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}. Reason: {exception?.Message ?? "No error"}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
