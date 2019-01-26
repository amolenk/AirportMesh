using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace SortService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SortController : ControllerBase
    {
        private const string InstructionsPath = "data/sort-instructions.json";

        [HttpGet("{flightNumber}")]
        public async Task<ActionResult<int>> Get(string flightNumber)
        {
            // Get the airline code from the flight number.
            var airline = flightNumber.Substring(0, 2);

            // Load the instructions for the sorting machine from disk.
            var instructions = await LoadSortingMachineInstructionsAsync();

            // Default to conveyor belt 0 if the airline isn't mapped.
            return instructions.ContainsKey(airline) ? instructions[airline] : 0;
        }

        private async Task<Dictionary<string, int>> LoadSortingMachineInstructionsAsync()
        {
            if (System.IO.File.Exists(InstructionsPath))
            {
                var json = await System.IO.File.ReadAllTextAsync(InstructionsPath);

                return JsonConvert.DeserializeObject<Dictionary<string, int>>(json);
            }

            return new Dictionary<string, int>();
        }
    }
}
