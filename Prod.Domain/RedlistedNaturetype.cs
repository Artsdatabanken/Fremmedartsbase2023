using System.Collections.Generic;

namespace Prod.Domain
{

    public class RedlistedNaturetype
    {
        public string Id { get; set; } 
        public string theme { get; set; }
        public string link { get; set; } 
        public string name { get; set; } 
        public string NiN1TypeCode { get; set; } 
        public string KTVNin1 { get; set; } 
        public string category { get; set; } 

    }

    public class RedlistedNaturetypeGroup
    {
        public string Id { get; set; }
        public bool collapsed { get; set; } = true;
        public IEnumerable<RedlistedNaturetype> children { get; set; }

    }

        public class RedlistedNaturetypeGroups 
    {
        public string Id { get; set; }
        public IEnumerable<RedlistedNaturetypeGroup> children { get; set; } 
    }
}
