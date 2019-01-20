using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace Test
{
    class Program
    {
        private static readonly HttpClient client = new HttpClient();

        static void Main(string[] args)
        {
            MainAsync().GetAwaiter().GetResult();
        }

        static async Task MainAsync()
        {
            await Task.WhenAll(
                CallServiceContinuously()
            );
        }

        private static async Task CallServiceContinuously()
        {
            while (true)
            {
                await CallService();
                await Task.Delay(500);
            }
        }

        private static async Task CallService()
        {
            try	
            {
                HttpResponseMessage response = await client.PutAsync("http://13.73.145.242/api/checkin/QTLMVO", new StringContent(string.Empty));
                response.EnsureSuccessStatusCode();

                Console.WriteLine("OK");
            }  
            catch(HttpRequestException e)
            {
                Console.WriteLine(e.Message);
            }
        }
    }
}
