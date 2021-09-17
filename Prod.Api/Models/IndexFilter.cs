namespace Prod.Api.Controllers
{
    public class IndexFilter
    {
        public int Page { get; set; }
        public int PageSize { get; set; }

        public HistoryFilter HistoryFilter { get; set; }
        public CurrentFilter CurrentFilter { get; set; }
        public ProgressFilter ProgressFilter { get; set; }
    }

    public class ProgressFilter
    {
    }

    public class CurrentFilter
    {
    }

    public class HistoryFilter
    {
    }
}