using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace Prod.Feedback.Services
{
    public class ClientIpCheckActionFilter : ActionFilterAttribute
    {
        private readonly ILogger _logger;
        private readonly string _safelist;

        public ClientIpCheckActionFilter(string safelist, ILogger logger)
        {
            _safelist = safelist;
            _logger = logger;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var remoteIp = context.HttpContext.Connection.RemoteIpAddress;
            _logger.LogDebug("Remote IpAddress: {RemoteIp}", remoteIp);
            var ip = _safelist.Split(';', StringSplitOptions.RemoveEmptyEntries);
            var badIp = true;

            if (remoteIp.IsIPv4MappedToIPv6)
            {
                remoteIp = remoteIp.MapToIPv4();
            }

            foreach (var address in ip)
            {
                var testIp = IPAddress.Parse(address);

                if (testIp.Equals(remoteIp))
                {
                    badIp = false;
                    break;
                }
            }

            if (badIp)
            {
                _logger.LogWarning("Forbidden Request from IP: {RemoteIp}", remoteIp);
                var contentResult = new ContentResult { Content = $"Forbidden Request from IP: {remoteIp} - logged", StatusCode = StatusCodes.Status403Forbidden };
                context.Result = contentResult;
                //context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                return;
            }

            base.OnActionExecuting(context);
        }
    }
}
