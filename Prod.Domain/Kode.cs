using System.Collections.Generic;

namespace Prod.Domain
{
    public class Kode
    {
        public int Id { get; set; }
        public string Context { get; set; }
        public string JsonData { get; set; }
    }

    public class KodeGrupper
    {
        public string Id { get; set; }
        public Dictionary<string, IEnumerable<Kode>> Grupper { get; set; }
    }
}
