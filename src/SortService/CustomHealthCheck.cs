using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SortService
{
    public class CustomHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (System.IO.File.Exists("breakSortOTron"))
            {
                return Task.FromResult(
                    HealthCheckResult.Unhealthy("Broken by user. To return to healthy state, remove breakSortOTron file."));
            }

            return Task.FromResult(
                HealthCheckResult.Healthy());
        }
    }
}