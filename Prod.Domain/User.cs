using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
//using Newtonsoft.Json;

namespace Prod.Domain
{
    public class User
    {
        public User()
        {
            EkspertgruppeRoller = new List<EkspertgruppeRolle>();
        }

        public Guid Id { get; set; }
        public bool ErAdministrator { get; set; }
        public string Brukernavn { get; set; }
        public string Navn { get; set; }
        public string Email { get; set; }
        public string Soknad { get; set; }
        public bool HarTilgang { get; set; }
        public bool HarSoktOmTilgang { get; set; }

        public bool TilgangAvvist { get; set; }
        public DateTime DatoForTilgang { get; set; }
        public DateTime DatoOpprettet { get; set; }
        public DateTime DatoSistAktiv { get; set; }

        public List<EkspertgruppeRolle> EkspertgruppeRoller { get; set; }

        public class EkspertgruppeRolle
        {
            public string EkspertgruppeId { get; set; }
            public Guid BrukerId { get; set; }
            [JsonIgnore]
            public User User { get; set; }
            public bool Leder { get; set; }

            public bool Skriver { get; set; }

            public bool Leser { get; set; }

            public DateTime DatoOpprettet { get; set; }
            public Guid OpprettetAvBrukerId { get; set; }

        }


    }

}
