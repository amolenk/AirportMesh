using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HomelandSecurityService
{
    public class QueueHostedService : BackgroundService
    {
        private readonly IBackgroundTaskQueue _queue;
        private readonly ILogger<QueueHostedService> _logger;

        public QueueHostedService(IBackgroundTaskQueue queue, ILogger<QueueHostedService> logger)
        {
            _queue = queue;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // var storageAccountName = Environment.GetEnvironmentVariable("AIRPORTMESH_STORAGE_ACCOUNT_NAME");
            // var storageAccountKey = Environment.GetEnvironmentVariable("AIRPORTMESH_STORAGE_ACCOUNT_KEY");

            // // Fix for Mesh not correctly handling '=' in environment variables.
            // // See https://github.com/amolenk/AirportMesh/issues/1.
            // storageAccountKey = storageAccountKey.PadRight(88, '=');

            // var storageCredentials = new StorageCredentials(storageAccountName, storageAccountKey);
            // var storageAccount = new CloudStorageAccount(storageCredentials, true);

            // var blobClient = storageAccount.CreateCloudBlobClient();
            // var container = blobClient.GetContainerReference("passportcheckresults");

            var backPressure = 0;
            while (!stoppingToken.IsCancellationRequested)
            {
                if (_queue.TryDequeuePassport(out string passportNumber))
                {
                    backPressure += 1;

                    _logger.LogInformation($"Processing passport '{passportNumber}'...");

                    // ACTUAL CODE REDACTED BY DEPARTMENT OF HOMELAND SECURITY
                    await Task.Delay(Math.Min(backPressure * 2000, 6000));

//                    var resultBlob = container.GetBlockBlobReference(retrievedMessage.AsString);
//                    await resultBlob.UploadTextAsync("Passed");

//                    await queue.DeleteMessageAsync(retrievedMessage);
                }
                else
                {
                    // Queue is empty, let's wait a short while for a message to arrive.
                    await Task.Delay(250);
                    backPressure = 0;
                }
            }
        }
    }
}
