using System;

namespace Prod.Api.Controllers
{
    public class IndexFilter
    {
        public IndexFilter()
        {
            History = new History();
            Current = new Current();
            Progress = new Progress();
            Horizon = new Horizon();
        }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public string[] Responsible { get; set; } = Array.Empty<string>();

        public string NameSearch { get; set; } = string.Empty;

        public History History { get; set; }
        public Current Current { get; set; }
        public Progress Progress { get; set; }
        public Horizon Horizon { get; set; }
        public bool HorizonScan { get; set; }
    }

    public class Progress
    {
    }

    public class Current
    {
    }

    public class History
    {
    }
    public class Horizon
    {
        public string[] NR2018 { get; set; } = Array.Empty<string>();
        public bool NotStarted { get; set; } = false;
        public bool Finished { get; set; }
        public bool ToAssessment { get; set; }
        public bool NotAssessed { get; set; }
    }
}