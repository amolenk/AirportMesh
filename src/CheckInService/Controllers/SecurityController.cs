using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CheckInService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SecurityController : ControllerBase
    {
        private readonly HomelandSecurityClient _homelandSecurityClient;
        
        public SecurityController(HomelandSecurityClient homelandSecurityClient)
        {
            _homelandSecurityClient = homelandSecurityClient;
        }
        
        [HttpPut("{passportNumber}")]
        public async Task<IActionResult> Put(string passportNumber)
        {
            var result = await _homelandSecurityClient.DoBackgroundCheck(passportNumber);

            #region Do other important check-in thingies
            // TODO
            #endregion
            
            return Ok(result);
        }
    }
}
