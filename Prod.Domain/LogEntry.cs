using System;

namespace Prod.Domain
{
    public class LogEntry
    {
        public string message, stack, url, userName, roles, version, commitHash, build, userAgent;
        public DateTime created = DateTime.Now;
    }
}