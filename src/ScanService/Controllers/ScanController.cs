using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using ScanService.Models;

namespace ScanService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScanController : ControllerBase
    {
        [HttpGet]
        public ActionResult<ScanOTronInstructions> Get([FromQuery] string xRayData)
        {
            // This ultra-sophisticated AI algorithm can detect contraband/illegal
            // items in scanned x-ray images of baggage.

            // We need some x-ray data to operate on.
            if (string.IsNullOrWhiteSpace(xRayData))
            {
                return BadRequest();
            }

            // If we get a positive result, divert the luggage for further inspection.
            var positiveResult = XRayDataAnalyzer.Analyze(xRayData);
            if (positiveResult)
            {
                return new ScanOTronInstructions(true, DivertSetting.LittleNudge);
            }

            return new ScanOTronInstructions(false, DivertSetting.None);
        }
    }
}
