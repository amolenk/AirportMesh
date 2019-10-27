using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Auth;
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

            var storageAccountName = Environment.GetEnvironmentVariable("AIRPORTMESH_STORAGE_ACCOUNT_NAME");
            var storageAccountKey = Environment.GetEnvironmentVariable("AIRPORTMESH_STORAGE_ACCOUNT_KEY");

            // Fix for Mesh not correctly handling '=' in environment variables.
            // See https://github.com/amolenk/AirportMesh/issues/1.
            storageAccountKey = storageAccountKey.PadRight(88, '=');

            var storageCredentials = new StorageCredentials(storageAccountName, storageAccountKey);
            var storageAccount = new CloudStorageAccount(storageCredentials, true);

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
