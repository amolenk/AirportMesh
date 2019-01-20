using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CheckInService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckInController : ControllerBase
    {
        private static string Id = Guid.NewGuid().ToString();

        // TODO Wrap all throttling stuff in an action attribute
        // https://stackoverflow.com/questions/29550995/returning-429-too-many-requests-from-action-attribute

        private static readonly TimeSpan WindowSize = TimeSpan.FromSeconds(2);
        private const int MaxRequestsPerWindow = 1;

        private static int RequestCountInWindow = 0;
        private static DateTime WindowStart = DateTime.MinValue;

        private static readonly object Lock = new object();

        [HttpGet]
        public IActionResult Get()
        {
            return Ok("Hello, world!");
        }

        [HttpPut("{confirmationNumber}")]
        public IActionResult Put(string confirmationNumber)
        {
            lock (Lock)
            {
                // Start a new window if this is the very first call, or the
                // previous window has passed
                if (WindowStart == DateTime.MinValue
                    || WindowStart + WindowSize < DateTime.Now)
                {
                    WindowStart = DateTime.Now;
                    RequestCountInWindow = 0;
                }

                // Check if there's room for the current request in this window.
                if (RequestCountInWindow < MaxRequestsPerWindow)
                {
                    RequestCountInWindow += 1;
                }
                else
                {
                      return Ok($"Please wait! [{Id}]");

//                    return StatusCode((int)HttpStatusCode.TooManyRequests);
                }
            }

            return Ok($"You are checked in! [{Id}]");
        }
    }
}
