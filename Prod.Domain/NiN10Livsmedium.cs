using System.Collections.Generic;

namespace Prod.Domain
{
    public class Livsmedium
    {
        public string Id { get; set; }
        public string kode { get; set; }
        public string navn { get; set; }
        //public bool collapsed { get; set; } = true;
        public IEnumerable<Livsmedium> children { get; set; }

    }
}
