using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Prod.Api.Controllers
{
    [Route("api/[controller]")]
    public class LogController : Controller
    {
        [HttpPost]
        public string Write([FromBody] Prod.Domain.LogEntry logEntry)
        {
            return "ok";
        }
    }
}
