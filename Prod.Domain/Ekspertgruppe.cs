using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Prod.Domain
{
    public class ExpertGroup
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public User.EkspertgruppeRolle Rolle { get; set; }
       // public string EkspertgruppeLeder { get; set; }
        //public IEnumerable<TaxonSearchResult> Taxons { get; set; }
    }

    public class ExpertGroupMember
    {
        public string EkspertgruppeId { get; set; }
        public string GUID { get; set; }
        public string BrukerPresentasjon { get; set; }

        public bool Leder { get; set; }

        public bool Skriver { get; set; }

        public bool Leser { get; set; }
    }

    public class Ekspertgrupper
    {
        public int Id { get; set; }
        public DateTime SistOppdatert { get; set; }
        public string Ekspertgruppenavn { get; set; }
        public bool HarUnderart { get; set; }
        public bool BrukerMarineOmråder { get; set; }
        public bool BrukerFinnesINorge { get; set; }
        //public string RegionID { get; set; }
        public bool HarImportert { get; set; }
        //public Rødliste2015.Regioner Region { get; set; }

        public Ekspertgrupper()
        {
            Id = 0;
            SistOppdatert = DateTime.MinValue;
            Ekspertgruppenavn = "";
            HarUnderart = false;
            //RegionID = "";
            this.BrukerMarineOmråder = false;
            this.BrukerFinnesINorge = false;
            HarImportert = false;
            //Region = default(Rødliste2015.Regioner);
        }
    }
    public class GUIDEkspertgruppe
    {
        public string BrukerID { get; set; }
        public int EkspertgruppeID { get; set; }
        public string Brukernavn { get; set; }
        private Ekspertgrupper m_EkspertgruppeID;
        public bool Skrivetilgang { get; set; }
        public bool ErLeder { get; set; }

        public GUIDEkspertgruppe()
        {
            Brukernavn = "";
        }

        public Ekspertgrupper Ekspertgruppe
        {
            get { return m_EkspertgruppeID; }
            set
            {
                m_EkspertgruppeID = value;
                if (value == null) return;
                EkspertgruppeID = value.Id;
            }
        }

    }
    public class EkspertgruppeTilgang
    {
        public Ekspertgrupper Ekspertgruppe { get; set; }
        public int EkspertgruppeID { get; set; }
        public string Kategori { get; set; }
        public int LatinsknavnId { get; set; }
        public string Taksanavn { get; set; }
    }

}
