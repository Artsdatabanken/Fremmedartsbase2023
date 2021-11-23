//using Prod.Data.EFCore;
using Prod.Domain;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using System.Text.Json;
using System.Text.Encodings.Web;

namespace SwissKnife.Database
{
    internal static class Convert2JSONService
    {
        

        public class ImportFormat
        {
            public string Id { get; set; } 
            public string Eksperttema { get; set; } 
            public string Vurderingsenhet { get; set; } 
            public string Kortnavn { get; set; } 
            public string Typekode { get; set; }
            [Name("Kilde til variasjon")]
            public string KildeTilVariasjon { get; set; } 
            public string Type { get; set; } 
            [Name("Beskrivelse av vurderingsenheten")]
            public string BeskrivelseAvVurderingsenheten { get; set; } 
            public string Totalareal { get; set; } 
            [Name("Totalareal, mørketall")]
            public string TotalarealMørketall { get; set; } 
            [Name("Totalareal, beregnet")]
            public string TotalarealBeregnet { get; set; } 
            public string Utbredelsesareal { get; set; } 
            [Name("Utbredelsesareal, mørketall")]
            public string UtbredelsesarealMørketall { get; set; } 
            [Name("Utbredelsesareal, beregnet")]
            public string UtbredelsesarealBeregnet { get; set; } 
            [Name("Forekomster, antall")]
            public string ForekomsterAntall { get; set; } 
            [Name("Forekomster, mørketall")]
            public string ForekomsterMørketall { get; set; } 
            [Name("Forekomster, beregnet")]
            public string ForekomsterBeregnet { get; set; } 
            [Name("Kommentar, Arealinformasjon")]
            public string KommentarArealinformasjon { get; set; } 
            [Name("Alle kategorier og kriterier")]
            public string AlleKategorierOgKriterier { get; set; } 
            [Name("Gjeldene kategori og kriterie")]
            public string GjeldeneKategoriOgKriterie { get; set; } 
            public string Kriteriedokumentasjon { get; set; } 
            [Name("Påvirkningsfaktorer, fritekst")]
            public string PåvirkningsfaktorerFritekst { get; set; } 
            public string Øs { get; set; } 
            public string OA { get; set; } 
            public string He { get; set; } 
            public string Op { get; set; } 
            public string Bu { get; set; } 
            public string Ve { get; set; } 
            public string Te { get; set; } 
            public string Aa { get; set; } 
            public string Va { get; set; } 
            public string Ro { get; set; } 
            public string Ho { get; set; } 
            public string Sf { get; set; } 
            public string Mr { get; set; } 
            public string Tø { get; set; } 
            public string No { get; set; } 
            public string Tr { get; set; } 
            public string Fi { get; set; } 
            public string Sv { get; set; } 
            public string Jm { get; set; } 
            public string HPo { get; set; } 
            public string HBa { get; set; } 
            public string HNh { get; set; } 
            public string HNs { get; set; } 
            public string HSk { get; set; } 
            public string Forfattere { get; set; } 

        }

        public class jsonNT
        {
            public string Id { get; set; }
            public string Value { get; set; }
            public string Text { get; set; }
            public List<jsonNT> Children { get; set; }
        }


            public static void ConvertTrueteOgSjeldneNaturtyper2JSON( string inputfilename, string outputfilename)
        {
            var theCsvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"))
            {
                Delimiter = "\t",
                Encoding = Encoding.UTF8
            };

            var root = new jsonNT();
            root.Id = "root";
            root.Text = "root";
            root.Value = "root";
            root.Children = new List<jsonNT>();

            using (var reader = new StreamReader( inputfilename))
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<ImportFormat>();
                foreach (var importFormat in records)
                {
                    var nt = new jsonNT();
                    nt.Id = (importFormat.Id).Trim();
                    nt.Text = (importFormat.Kortnavn).Trim();
                    nt.Value = (importFormat.Typekode + " " + importFormat.KildeTilVariasjon).Trim();
                    nt.Children = new List<jsonNT>();
                    root.Children.Add(nt);
                    //Console.WriteLine($"{importFormat.Id} {importFormat.Vurderingsenhet} {importFormat.Kortnavn} {importFormat.Typekode}");
                }
            }

            var jsonSerializerOptions = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                WriteIndented = true
            };
            string jsonString = JsonSerializer.Serialize(root, jsonSerializerOptions);
            File.WriteAllText(outputfilename, jsonString);

            Console.WriteLine("ConvertTrueteOgSjeldneNaturtyper2JSON   ferdig!");
        }
    }
}
