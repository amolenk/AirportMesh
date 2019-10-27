using Microsoft.AspNetCore.Mvc;

namespace HomelandSecurityService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BackgroundCheckController : ControllerBase
    {
        private readonly IBackgroundTaskQueue _queue;

        public BackgroundCheckController(IBackgroundTaskQueue queue)
            => _queue = queue;

        [HttpPost("{passportNumber}")]
        public void Post(string passportNumber)
        {
            _queue.QueuePassport(passportNumber);
        }
    }
}
