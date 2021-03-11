using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;


namespace Prod.Api.Hubs
{
    public class MessageHub : Hub
    {
        public Task SendMessage(string context, string message)
        {
            return Clients.All.SendAsync( "ReceiveMessage", context, message);
        }
    }
}