using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace CheckInService
{
    public class HomelandSecurityClient
    {
        private readonly HttpClient _client;

        public HomelandSecurityClient(HttpClient client)
        {
            _client = client;
            _client.BaseAddress = new Uri("http://airportmesh.homelandsecurity/");
        }

        public async Task<bool> DoBackgroundCheck(string passportNumber)
        {
            var response = await _client.GetAsync($"api/backgroundcheck/{passportNumber}");

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync();

            return result == "PASSED";
        }
    }
}
