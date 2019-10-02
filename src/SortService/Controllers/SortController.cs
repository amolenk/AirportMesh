using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Polly;

namespace SortService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SortController : ControllerBase
    {
        #region

        private static readonly AsyncPolicy<int> CircuitBreakerPolicy = Policy<int>
            .Handle<Exception>()
            .CircuitBreakerAsync(3, TimeSpan.FromSeconds(10));

        #endregion
        
        private static readonly AsyncPolicy<int> FallbackPolicy = Policy<int>
            .Handle<Exception>()
            .FallbackAsync(0);

        [HttpGet("{flightNumber}")]
        public async Task<ActionResult<int>> Get(string flightNumber)
        {
            // Get the airline code from the flight number.
            var airline = flightNumber.Substring(0, 2);

            return await FallbackPolicy.ExecuteAsync(() =>
                HighlyComplexSortingAlgorithmWithDependenciesThatSometimesFailAsync(airline));
        }

        #region Code under One-Way Airlines(TM) NDA

        private async Task<int> HighlyComplexSortingAlgorithmWithDependenciesThatSometimesFailAsync(string airline)
        {
            if (System.IO.File.Exists("breakSortOTron"))
            {
                // Simulate timeout
                await Task.Delay(2500);
                throw new Exception("Timed out!");
            }

            switch (airline)
            {
                case "KL": return 1;
                case "OA": return 1;
                default: return 0;
            }
        }
        
        #endregion
    }
}
