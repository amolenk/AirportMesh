using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HomelandSecurityService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BackgroundCheckController : ControllerBase
    {   
        private static Random Random = new Random();

        [HttpGet("{passportNumber}")]
        public async Task<IActionResult> Get(string passportNumber)
        {
            await Task.Delay(Random.Next(3000));

            var fail = ShouldFail();
            if (fail)
            {
                return new StatusCodeResult((int)HttpStatusCode.InternalServerError);
            }

            return Ok("PASSED");
        }

        private bool ShouldFail()
        {
            if (System.IO.File.Exists("down"))
            {
                return true;
            }

            return Random.Next(2) == 1;
        }
    }
}
