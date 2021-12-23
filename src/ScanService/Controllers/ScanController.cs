using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.RetryPolicies;
using ScanService.Models;

namespace ScanService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScanController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<ScanOTronInstructions>> Get([FromQuery] string xRayData)
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
                await UploadXRayDataToBlobAsync(xRayData);

                return new ScanOTronInstructions(true, DivertSetting.LittleNudge);
            }

            return new ScanOTronInstructions(false, DivertSetting.None);
        }

        private async Task UploadXRayDataToBlobAsync(string xRayData)
        {
            CloudStorageAccount account = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("StorageConnectionString"));
            
            CloudBlobClient blobClient = account.CreateCloudBlobClient();

            CloudBlobContainer blobContainer = blobClient.GetContainerReference("xrays");

            CloudBlockBlob blob = blobContainer.GetBlockBlobReference($"{DateTime.Now.Ticks}-{Guid.NewGuid()}");

            await blob.UploadTextAsync(xRayData);
        }
    }
}
