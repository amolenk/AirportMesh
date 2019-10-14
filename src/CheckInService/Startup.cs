using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;

namespace CheckInService
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowLocalhostOrigin",
                    builder => builder.WithOrigins("http://localhost:8080").WithMethods("GET", "PUT"));
            });

            // services.AddHttpClient<HomelandSecurityClient>(client =>
            // {
            //     client.BaseAddress = new Uri("http://airportmesh.homelandsecurity/");
            // })

            #region

            Random jitterer = new Random(); 

            services.AddHttpClient<HomelandSecurityClient>(client =>
                {
                    client.BaseAddress = new Uri("http://airportmesh.homelandsecurity/");
                })
                .AddTransientHttpErrorPolicy(builder => builder
                    .WaitAndRetryAsync(3, retryAttempt =>
                         TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
                         + TimeSpan.FromMilliseconds(jitterer.Next(0, 100)))
                );

            #endregion

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("AllowLocalhostOrigin");
            app.UseMvc();
        }
    }
}
