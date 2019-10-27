using Microsoft.AspNetCore.SignalR;

namespace CheckInService.Hubs
{
    public class PassportHub : Hub
    {
        public void NotifyBackgroundCheckCompleted(string passportNumber, string result)
        {
            Clients.All.SendAsync("backgroundCheckCompleted", passportNumber, result);
        }
    }
}