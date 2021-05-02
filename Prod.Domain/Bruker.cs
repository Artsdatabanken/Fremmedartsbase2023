using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Prod.Domain
{
    public class Bruker
    {
        public Bruker()
        {
            EkspertgruppeRoller = new List<EkspertgruppeRolle>();
        }

        public string GUID { get; set; }
        public string Brukernavn { get; set; }
        public List<EkspertgruppeRolle> EkspertgruppeRoller { get; set; }

        public class EkspertgruppeRolle
        {
            public string EkspertgruppeId { get; set; }

            public bool Leder { get; set; }

            public bool Skriver { get; set; }

            public bool Leser { get; set; }
        }

        //public IEnumerable<Ekspertgruppe> Ekspertgrupper { get; set; }
        public string ValgtArtId { get; set; }
        // public bool ErAdministrator { get; set; }
    }

}
