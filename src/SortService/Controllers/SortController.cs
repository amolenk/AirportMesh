using System;
using Microsoft.AspNetCore.Mvc;
using Polly;

namespace SortService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SortController : ControllerBase
    {
        private static readonly Policy<int> SortingFailurePolicy = Policy<int>
            .Handle<Exception>()
            .WaitAndRetry(3, _ => TimeSpan.FromSeconds(1))
            ;

        [HttpGet("{flightNumber}")]
        public ActionResult<int> Get(string flightNumber)
        {
            // Get the airline code from the flight number.
            var airline = flightNumber.Substring(0, 2);

            try
            {
                return SortingFailurePolicy.Execute(() =>
                    HighlyComplexSortingAlgorithmWithDependenciesThatSometimesFail(airline));
            }
            catch
            {
                // Default to conveyor belt 0 if something went wrong.
                return 0;
            }
        }

        #region Code under One-Way Airlines(TM) NDA
        private int HighlyComplexSortingAlgorithmWithDependenciesThatSometimesFail(string airline)
        {
            if (System.IO.File.Exists("breakSortOTron"))
            {
                throw new Exception("Boom!");
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
