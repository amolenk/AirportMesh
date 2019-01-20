using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ScanService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScanController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<bool>> Get([FromQuery] string imageData)
        {
            // This ultra-sophisticated AI algorithm can detect contraband/illegal
            // items in scanned x-ray images of baggage.

            // We need some image data to operate on.
            if (string.IsNullOrWhiteSpace(imageData))
            {
                return BadRequest();
            }

            // Sophisticated algorithms can take a lot of time, let's wait a
            // little while.
            await Task.Delay(TimeSpan.FromSeconds(1));

            // Base the result on whether or not we find something iffy in the
            // image data.
            return imageData.Contains("[something_iffy]");
        }
    }
}
