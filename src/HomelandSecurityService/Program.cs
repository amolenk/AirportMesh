using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Queue;
using System;
using System.Collections;
using System.IO;
using System.Threading.Tasks;

namespace HomelandSecurityService
{
    class Program
    {
        static void Main(string[] args)
        {
            MainAsync().GetAwaiter().GetResult();
        }

        static async Task MainAsync()
        {
            // Dump env vars for Secrets debugging...
            foreach (DictionaryEntry envVar in Environment.GetEnvironmentVariables())
            {
                System.Console.WriteLine($"{envVar.Key} = {envVar.Value}");
            }

            // This should work, but doesn't :-(
            //var fabricSettingsPath = Environment.GetEnvironmentVariable("Fabric_SettingPath");
            //var secretPath = System.IO.Path.Combine(fabricSettingsPath, "airportMeshStorageAccountKey");
            //var connectionString = await File.ReadAllTextAsync(secretPath);

            #region Hardcoded connection string for now
            var connectionString = "DefaultEndpointsProtocol=https;AccountName=airportmesh;AccountKey=Hgd/rGcL8o61cuMtqf5VV4HaZ30mPcB8pDqcOLWeAp5E7Okx5H0NGRFS4kUBfJP/S6IzpLTMJmG90AmIRYNaVA==;BlobEndpoint=https://airportmesh.blob.core.windows.net/;QueueEndpoint=https://airportmesh.queue.core.windows.net/;TableEndpoint=https://airportmesh.table.core.windows.net/;FileEndpoint=https://airportmesh.file.core.windows.net/;";
            #endregion

            var storageAccount = CloudStorageAccount.Parse(connectionString);

            var queueClient = storageAccount.CreateCloudQueueClient();
            var queue = queueClient.GetQueueReference("passportcheckrequests");

            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference("passportcheckresults");

            var backPressure = 0;
            while (true)
            {
                var retrievedMessage = await queue.GetMessageAsync();
                if (retrievedMessage != null)
                {
                    backPressure += 1;

                    // ACTUAL CODE REDACTED BY DEPARTMENT OF HOMELAND SECURITY
                    await Task.Delay(Math.Min(backPressure * 2000, 6000));

                    var resultBlob = container.GetBlockBlobReference(retrievedMessage.AsString);
                    await resultBlob.UploadTextAsync("Passed");

                    await queue.DeleteMessageAsync(retrievedMessage);
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
