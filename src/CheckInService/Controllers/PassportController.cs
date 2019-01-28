using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Auth;
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
            // This should work, but doesn't :-(
            //var fabricSettingsPath = Environment.GetEnvironmentVariable("Fabric_SettingPath");
            //var secretPath = System.IO.Path.Combine(fabricSettingsPath, "airportMeshStorageAccountKey");
            //var connectionString = await File.ReadAllTextAsync(secretPath);

            var storageAccountName = Environment.GetEnvironmentVariable("AIRPORTMESH_STORAGE_ACCOUNT_NAME");
            var storageAccountKey = Environment.GetEnvironmentVariable("AIRPORTMESH_STORAGE_ACCOUNT_KEY");

            // Fix for Mesh not correctly handling '=' in environment variables.
            // See https://github.com/amolenk/AirportMesh/issues/1.
            storageAccountKey = storageAccountKey.PadRight(88, '=');

            var storageCredentials = new StorageCredentials(storageAccountName, storageAccountKey);
            var storageAccount = new CloudStorageAccount(storageCredentials, true);

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
                // The request has been processed.
                return Ok("Ok");
            }

            // The request hasn't been processed completely yet.
            return Ok("Busy");
        }

        [HttpPut("{passportNumber}")]
        public async Task<IActionResult> Put(string passportNumber)
        {
            var message = new CloudQueueMessage(passportNumber);
            await _queue.AddMessageAsync(message);

            return Accepted();
        }

        private async Task<bool> HasPassportCheckCompleted(string passportNumber)
        {
            var blob = _container.GetBlobReference(passportNumber);
            return await blob.ExistsAsync();
        }
    }
}
