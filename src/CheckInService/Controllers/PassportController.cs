using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Queue;

namespace CheckInService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PassportController : ControllerBase
    {
        private readonly CloudQueue _queue;
        private readonly CloudBlobContainer _container;

        public PassportController()
        {
            var connectionString = "DefaultEndpointsProtocol=https;AccountName=airportmesh;AccountKey=Hgd/rGcL8o61cuMtqf5VV4HaZ30mPcB8pDqcOLWeAp5E7Okx5H0NGRFS4kUBfJP/S6IzpLTMJmG90AmIRYNaVA==;BlobEndpoint=https://airportmesh.blob.core.windows.net/;QueueEndpoint=https://airportmesh.queue.core.windows.net/;TableEndpoint=https://airportmesh.table.core.windows.net/;FileEndpoint=https://airportmesh.file.core.windows.net/;";
            var storageAccount = CloudStorageAccount.Parse(connectionString);

            var queueClient = storageAccount.CreateCloudQueueClient();
            _queue = queueClient.GetQueueReference("passportcheckrequests");

            var blobClient = storageAccount.CreateCloudBlobClient();
            _container = blobClient.GetContainerReference("passportcheckresults");
        }
        
        [HttpGet("{passportNumber}")]
        public async Task<IActionResult> Get(string passportNumber)
        {
            if (await HasPassportCheckCompleted(passportNumber))
            {
                // The request has been processed, return 200 - Ok.
                return Ok("Ok");
            }

            // The request hasn't been processed completely yet, let
            // the caller know by returning 202 - Accepted.
            return Accepted("Busy");
        }

        [HttpPut("{passportNumber}")]
        public async Task<IActionResult> Put(string passportNumber)
        {
            var message = new CloudQueueMessage(passportNumber);
            await _queue.AddMessageAsync(message);

            // Wait a small amount of time for the request to be processed.
//            await Task.Delay(250);

            return Accepted();
            // Get the status of the passport check.
//            return await Get(passportNumber);
        }

        private async Task<bool> HasPassportCheckCompleted(string passportNumber)
        {
            var blob = _container.GetBlobReference(passportNumber);
            return await blob.ExistsAsync();
        }
    }
}
