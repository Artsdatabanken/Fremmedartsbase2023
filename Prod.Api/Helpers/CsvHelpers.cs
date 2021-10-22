using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;
using Prod.Domain;

namespace Prod.Api.Helpers
{
    public class CsvHelpers
    {
        public class FremmedartToCsvMap : ClassMap<FA4WithComments>
        {
            //public FremmedartToCsvMap()
            //{
            //    var i = 0;
            //    Map(m => m.Id).Index(i++).Name("Id");
            //    Map(m => m.ExpertGroup).Index(i++);
            //    Map(m => m.EvaluatedScientificNameId).Index(i++);
            //    Map(m => m.EvaluatedScientificName).Index(i++);
            //    Map(m => m.EvaluatedScientificNameAuthor).Index(i++);
            //    //Map(m => m.EvaluatedScientificNameRank).Index(i++); -- bare tallverdi
            //    //Map(m => m.EvaluatedVernacularName).Index(i++);
            //    Map(m => m.LastUpdatedBy).Index(i++);
            //    //Map(m => m.HorizonDoScanning).Index(i++);
            //    Map(m => m.HorizonEstablismentPotential).Index(i++);
            //    Map(m => m.HorizonEstablismentPotentialDescription).Index(i++);
            //    Map(m => m.HorizonEcologicalEffect).Index(i++);
            //    Map(m => m.HorizonEcologicalEffectDescription).Index(i++);

            //    //Map().Index(i++).Name("PotentialDoorKnocker").Convert(row => row.Row.GetField());

            //    Map(m => m.HorizonEcologicalEffectDescription).Index(i++);
                
            //    //Map(m => m.HorizonScanningStatus).Index(i++);
            //    ////Map(m => m.LatinsknavnId).Index(i++);
            //    //Map(m => m.Vurderingsår).Index(i++);
            //    //Map(m => m.VurdertVitenskapeligNavn).Index(i++);
            //    //Map(m => m.VurdertVitenskapeligNavnAutor).Index(i++);
            //    //Map(m => m.VurdertVitenskapeligNavnHierarki).Index(i++);
            //    //Map(m => m.VurdertVitenskapeligNavnId).Index(i++);
            //    //Map(m => m.TaxonId).Index(i++);
            //    //Map(m => m.TaxonRank).Index(i++);
            //    //Map(m => m.Ekspertgruppe).Index(i++);
            //    //Map(m => m.VurderingsContext).Index(i++);
            //    ////Map(m => m.UtdoddINorgeRE).Index(i++);
            //    //Map(m => m.OverordnetKlassifiseringGruppeKode).Index(i++);
            //    //Map(m => m.BegrensetForekomstNA).Index(i++).Name("OverordnetKlassifiseringKode")
            //    //    .ConvertUsing(delegate(FA3WithComments rl)
            //    //    {
            //    //        string result = null;
            //    //        switch (rl.OverordnetKlassifiseringGruppeKode)
            //    //        {
            //    //            case "rodlisteVurdertArt":
            //    //                result = rl.RodlisteVurdertArt;
            //    //                break;
            //    //            //case "sikkerBestandLC":
            //    //            //    break;
            //    //            case "utdoddINorgeRE":
            //    //                result = rl.UtdoddINorgeRE;
            //    //                break;
            //    //            case "begrensetForekomstNA":
            //    //                result = rl.BegrensetForekomstNA;
            //    //                break;
            //    //            //case "fremmedArtNA":
            //    //            //    break;
            //    //            case "kunnskapsStatusNE":
            //    //                result = rl.KunnskapsStatusNE;
            //    //                break;
            //    //            //case "storUsikkerhetOmKorrektKategoriDD":
            //    //            //    break;
            //    //            default:
            //    //                result = String.Empty;
            //    //                break;
            //    //        }

            //    //        return result ?? String.Empty;
            //    //    });
            //    ////Map(m => m.BegrensetForekomstNA).Index(i++);
            //    ////Map(m => m.KunnskapsStatusNE).Index(i++);

            //    ////Map(m => m.RodlisteVurdertArt).Index(i++);
            //    //Map(m => m.TroligUtdodd).Index(i++);
            //    ////Map(m => m.ArtenVurderesIkkeBegrunnelse).Index(i++);
            //    //Map(m => m.Generasjonslengde).Index(i++);
            //    ////Map(m => m.BERN).Index(i++);
            //    ////Map(m => m.BONN).Index(i++);
            //    ////Map(m => m.CITES).Index(i++);
            //    //Map(m => m.StatusIHenholdTilNaturvernloven).Index(i++);
            //    //Map(m => m.StatusIHenholdTilNaturmangfoldloven).Index(i++);
            //    //Map(m => m.MaxAndelAvEuropeiskBestand).Index(i++).Name("AndelAvEuropeiskBestand");
            //    //Map(m => m.MaxAndelAvGlobalBestand).Index(i++).Name("AndelAvGlobalBestand");
            //    //Map(m => m.AndelNåværendeBestand).Index(i++);
            //    ////Map(m => m.IUCNVurdert).Index(i++);
            //    //Map(m => m.A1OpphørtOgReversibel).Index(i++);

            //    //Map(m => m.A1OpphørtOgReversibelAntatt.Min).Index(i++).Name("A1OpphørtOgReversibelAntattMin");
            //    //Map(m => m.A1OpphørtOgReversibelAntatt.Max).Index(i++).Name("A1OpphørtOgReversibelAntattMax");
            //    //Map(m => m.A1OpphørtOgReversibelAntatt.Probable).Index(i++).Name("A1OpphørtOgReversibelAntattProbable");
            //    //Map(m => m.A1OpphørtOgReversibelAntatt.Quantile).Index(i++).Name("A1OpphørtOgReversibelAntattQuantile");
            //    //Map(m => m.A1EndringBasertpåKode).Index(i++);
            //    //Map(m => m.A2Forutgående10År).Index(i++);

            //    //Map(m => m.A2Forutgående10ÅrAntatt.Min).Index(i++).Name("A2Forutgående10ÅrAntattMin");
            //    //Map(m => m.A2Forutgående10ÅrAntatt.Max).Index(i++).Name("A2Forutgående10ÅrAntattMax");
            //    //Map(m => m.A2Forutgående10ÅrAntatt.Probable).Index(i++).Name("A2Forutgående10ÅrAntattProbable");
            //    //Map(m => m.A2Forutgående10ÅrAntatt.Quantile).Index(i++).Name("A2Forutgående10ÅrAntattQuantile");
            //    //Map(m => m.A2EndringBasertpåKode).Index(i++);
            //    //Map(m => m.A3Kommende10År).Index(i++);

            //    //Map(m => m.A3Kommende10ÅrAntatt.Min).Index(i++).Name("A3Kommende10ÅrAntattMin");
            //    //Map(m => m.A3Kommende10ÅrAntatt.Max).Index(i++).Name("A3Kommende10ÅrAntattMax");
            //    //Map(m => m.A3Kommende10ÅrAntatt.Probable).Index(i++).Name("A3Kommende10ÅrAntattProbable");
            //    //Map(m => m.A3Kommende10ÅrAntatt.Quantile).Index(i++).Name("A3Kommende10ÅrAntattQuantile");
            //    //Map(m => m.A3EndringBasertpåKode).Index(i++);
            //    //Map(m => m.A4Intervall10År).Index(i++);

            //    //Map(m => m.A4Intervall10ÅrAntatt.Min).Index(i++).Name("A4Intervall10ÅrAntattMin");
            //    //Map(m => m.A4Intervall10ÅrAntatt.Max).Index(i++).Name("A4Intervall10ÅrAntattMax");
            //    //Map(m => m.A4Intervall10ÅrAntatt.Probable).Index(i++).Name("A4Intervall10ÅrAntattProbable");
            //    //Map(m => m.A4Intervall10ÅrAntatt.Quantile).Index(i++).Name("A4Intervall10ÅrAntattQuantile");
            //    //Map(m => m.A4EndringBasertpåKode).Index(i++);
            //    //Map(m => m.B1UtbredelsesområdeKjentAndel).Index(i++).Name("B1UtbredelsesområdeKjent");
            //    //Map(m => m.B1UtbredelsesområdeMørketall).Index(i++);
            //    //Map(m => m.B1UtbredelsesområdeProdukt).Index(i++);

            //    //Map(m => m.B1IntervallUtbredelsesområde.Min).Index(i++).Name("B1IntervallUtbredelsesområdeMin");
            //    //Map(m => m.B1IntervallUtbredelsesområde.Max).Index(i++).Name("B1IntervallUtbredelsesområdeMax");
            //    //Map(m => m.B1IntervallUtbredelsesområde.Probable).Index(i++)
            //    //    .Name("B1IntervallUtbredelsesområdeProbable");
            //    //Map(m => m.B1IntervallUtbredelsesområde.Quantile).Index(i++)
            //    //    .Name("B1IntervallUtbredelsesområdeQuantile");
            //    //Map(m => m.B1IntervallUtbredelsesområde.Minintervall).Index(i++)
            //    //    .Name("B1IntervallUtbredelsesområdeMinintervall");
            //    //Map(m => m.B1IntervallUtbredelsesområde.Maxintervall).Index(i++)
            //    //    .Name("B1IntervallUtbredelsesområdeMaxintervall");
            //    //Map(m => m.B1IntervallUtbredelsesområde.Punktestimat).Index(i++)
            //    //    .Name("B1IntervallUtbredelsesområdePunktestimat");
            //    //Map(m => m.UtbredelsesområdePunktestimat).Index(i++);
            //    //Map(m => m.ForekomstarealPunktestimat).Index(i++);
            //    //Map(m => m.AntallLokaliteterPunktestimat).Index(i++);
            //    ////Map(m => m.B2IntervallForekomstareal).Index(i++);


            //    //Map(m => m.B2IntervallForekomstareal.Min).Index(i++).Name("B2IntervallForekomstarealMin");
            //    //Map(m => m.B2IntervallForekomstareal.Max).Index(i++).Name("B2IntervallForekomstarealMax");
            //    //Map(m => m.B2IntervallForekomstareal.Probable).Index(i++).Name("B2IntervallForekomstarealProbable");
            //    //Map(m => m.B2IntervallForekomstareal.Quantile).Index(i++).Name("B2IntervallForekomstarealQuantile");
            //    //Map(m => m.B2IntervallForekomstareal.Minintervall).Index(i++).Name("B2IntervallForekomstarealMinintervall");
            //    //Map(m => m.B2IntervallForekomstareal.Maxintervall).Index(i++).Name("B2IntervallForekomstarealMaxintervall");
            //    //Map(m => m.B2IntervallForekomstareal.Punktestimat).Index(i++).Name("B2IntervallForekomstarealPunktestimat");
            //    //Map(m => m.BA2FåLokaliteterProdukt).Index(i++);
            //    //Map(m => m.B1BeregnetAreal).Index(i++);
            //    //Map(m => m.B2BeregnetAreal).Index(i++);
            //    //Map(m => m.B1UtbredelsesområdeKode).Index(i++);
            //    //Map(m => m.B2ForekomstarealKjentAndel).Index(i++).Name("B2ForekomstarealKjent");
            //    //Map(m => m.B2ForekomstarealMørketall).Index(i++);
            //    //Map(m => m.B2ForekomstarealProdukt).Index(i++);
            //    //Map(m => m.B2ForekomstarealKode).Index(i++);
            //    //Map(m => m.BA1KraftigFragmenteringKode).Index(i++);
            //    //Map(m => m.BA2FåLokaliteterKode).Index(i++);
            //    ////Map(m => m.BaIntervallAntallLokaliteter).Index(i++);
            //    //Map(m => m.BaIntervallAntallLokaliteter.Min).Index(i++).Name("BaIntervallAntallLokaliteterMin");
            //    //Map(m => m.BaIntervallAntallLokaliteter.Max).Index(i++).Name("BaIntervallAntallLokaliteterMax");
            //    //Map(m => m.BaIntervallAntallLokaliteter.Probable).Index(i++).Name("BaIntervallAntallLokaliteterProbable");
            //    //Map(m => m.BaIntervallAntallLokaliteter.Quantile).Index(i++).Name("BaIntervallAntallLokaliteterQuantile");
            //    //Map(m => m.BaIntervallAntallLokaliteter.Minintervall).Index(i++).Name("BaIntervallAntallLokaliteterMinintervall");
            //    //Map(m => m.BaIntervallAntallLokaliteter.Maxintervall).Index(i++).Name("BaIntervallAntallLokaliteterMaxintervall");
            //    //Map(m => m.BaIntervallAntallLokaliteter.Punktestimat).Index(i++).Name("BaIntervallAntallLokaliteterPunktestimat");

            //    //Map(m => m.BBPågåendeArealreduksjonKode).Index(i++).Name("BbPågåendeArealreduksjonKode");
            //    //Map(m => m.BCEksterneFluktuasjonerKode).Index(i++).Name("BcEksterneFluktuasjonerKode");
            //    //Map(m => m.CReproductionDefinitionType).Index(i++);
            //    //Map(m => m.CPopulasjonsstørrelse).Index(i++);
            //    //Map(m => m.CReproductionDefinitionTemplateScale).Index(i++);
            //    //Map(m => m.CReproductionDefinitionTemplate).Index(i++);
            //    //Map(m => m.CReproductionDefinitionPerTree).Index(i++);
            //    //Map(m => m.CReproductionDefinitionPerLocation).Index(i++);
            //    //Map(m => m.CNumberOfLocations).Index(i++);
            //    //Map(m => m.CSubstratenheter).Index(i++);
            //    //Map(m => m.CAntallRameter).Index(i++);
            //    //Map(m => m.CAntallGeneter).Index(i++);
            //    //Map(m => m.CKjentPopulasjonsstørrelse).Index(i++);
            //    //Map(m => m.CKjentPopulasjonsstørrelseMørketall).Index(i++);
            //    //Map(m => m.CKjentPopulasjonsstørrelseProdukt).Index(i++);
            //    //Map(m => m.CVurdertpopulasjonsstørrelseProdukt).Index(i++);
            //    //Map(m => m.CDirekteFastsattEtterSkjønn).Index(i++);
            //    //Map(m => m.CPopulasjonsstørrelseAntatt.Min).Index(i++).Name("CPopulasjonsstørrelseAntattMin");
            //    //Map(m => m.CPopulasjonsstørrelseAntatt.Max).Index(i++).Name("CPopulasjonsstørrelseAntattMax");
            //    //Map(m => m.CPopulasjonsstørrelseAntatt.Probable).Index(i++).Name("CPopulasjonsstørrelseAntattProbable");
            //    //Map(m => m.CPopulasjonsstørrelseAntatt.Quantile).Index(i++).Name("CPopulasjonsstørrelseAntattQuantile");
            //    //Map(m => m.CPopulasjonsstørrelseAntatt.Minintervall).Index(i++).Name("CPopulasjonsstørrelseAntattMinintervall");
            //    //Map(m => m.CPopulasjonsstørrelseAntatt.Maxintervall).Index(i++).Name("CPopulasjonsstørrelseAntattMaxintervall");
            //    //Map(m => m.CPopulasjonsstørrelseAntatt.Punktestimat).Index(i++).Name("CPopulasjonsstørrelseAntattPunktestimat");
            //    //Map(m => m.PopulasjonsstørrelsePunktestimat).Index(i++);
            //    //Map(m => m.CPopulasjonsstørrelseKode).Index(i++);
            //    //Map(m => m.C1PågåendePopulasjonsreduksjonKode).Index(i++);
            //    //Map(m => m.C1PågåendePopulasjonsreduksjonAntatt.Min).Index(i++).Name("C1PågåendePopulasjonsreduksjonAntattMin");
            //    //Map(m => m.C1PågåendePopulasjonsreduksjonAntatt.Max).Index(i++).Name("C1PågåendePopulasjonsreduksjonAntattMax");
            //    //Map(m => m.C1PågåendePopulasjonsreduksjonAntatt.Probable).Index(i++).Name("C1PågåendePopulasjonsreduksjonAntattProbable");
            //    //Map(m => m.C1PågåendePopulasjonsreduksjonAntatt.Quantile).Index(i++).Name("C1PågåendePopulasjonsreduksjonAntattQuantile");

            //    //Map(m => m.C2A1PågåendePopulasjonsreduksjonKode).Index(i++);
            //    //Map(m => m.C2A1PågåendePopulasjonsreduksjonAntatt.Min).Index(i++).Name("C2A1PågåendePopulasjonsreduksjonAntattMin");
            //    //Map(m => m.C2A1PågåendePopulasjonsreduksjonAntatt.Max).Index(i++).Name("C2A1PågåendePopulasjonsreduksjonAntattMax");
            //    //Map(m => m.C2A1PågåendePopulasjonsreduksjonAntatt.Probable).Index(i++).Name("C2A1PågåendePopulasjonsreduksjonAntattProbable");
            //    //Map(m => m.C2A1PågåendePopulasjonsreduksjonAntatt.Quantile).Index(i++).Name("C2A1PågåendePopulasjonsreduksjonAntattQuantile");

            //    //Map(m => m.C2A2PågåendePopulasjonsreduksjonKode).Index(i++);
            //    //Map(m => m.C2A2SannhetsverdiKode).Index(i++);
            //    //Map(m => m.C2A2ReproduksjonsdyktigeIndivid).Index(i++);
            //    //Map(m => m.C2BPågåendePopulasjonsreduksjonKode).Index(i++);
            //    //Map(m => m.D1FåReproduserendeIndividKode).Index(i++);
            //    //Map(m => m.D2MegetBegrensetForekomstarealKode).Index(i++);
            //    //Map(m => m.EKvantitativUtryddingsmodellKode).Index(i++);

            //    ////Map(m => m.OverordnetKlassifiseringTekst).Index(i++);
            //    ////Map(m => m.OppsummeringAKriterier).Index(i++);
            //    ////Map(m => m.OppsummeringBKriterier).Index(i++);
            //    ////Map(m => m.OppsummeringCKriterier).Index(i++);
            //    ////Map(m => m.OppsummeringDKriterier).Index(i++);
            //    ////Map(m => m.OppsummeringEKriterier).Index(i++);
            //    //Map(m => m.Kriteriedokumentasjon).Index(i++); //.ConvertUsing(o => o.Kriteriedokumentasjon ?? "");
            //    ////Map(m => m.TilførselFraNaboland).Index(i++);
            //    ////Map(m => m.ÅrsakTilNedgraderingAvKategori).Index(i++);
            //    //Map().Name("ÅrsakTilNedgraderingAvKategori").Index(i++).ConvertUsing(rl => GetAarsakTilNedgraderingAvKategoritekst(rl));
            //    //Map(m => m.ÅrsakTilEndringAvKategori).Index(i++); //.ConvertUsing(o => o.ÅrsakTilEndringAvKategori ?? "");
            //    //Map(m => m.UtdøingSterktPåvirket).Index(i++);
            //    //Map(m => m.Kategori).Index(i++).Name("Kategori2021");
            //    //Map(m => m.Kriterier).Index(i++).Name("Kriterier2021");
            //    ////Map(m => m.HovedKriterier).Index(i++);
            //    //Map(m => m.KategoriFraForrigeListe).Index(i++).Name("Kategori2015");
            //    ////Map(m => m.KriterierFraForrigeListe).Index(i++);
            //    ////Map(m => m.KategoriEndretTil).Index(i++);
            //    ////Map(m => m.KategoriEndretFra).Index(i++);
            //    ////Map(m => m.GlobalRødlistestatusKode).Index(i++);
            //    //Map(m => m.ArtskartAdded).Index(i++);
            //    //Map(m => m.ArtskartRemoved).Index(i++);
            //    //Map(m => m.ArtskartManuellKommentar).Index(i++);
            //    //Map(m => m.ArtskartSistOverført).Index(i++);
            //    //Map(m => m.ArtskartModel.ObservationFromYear).Index(i++);
            //    //Map(m => m.ArtskartModel.ObservationToYear).Index(i++);
            //    //Map(m => m.ArtskartModel.FromMonth).Index(i++);
            //    //Map(m => m.ArtskartModel.ToMonth).Index(i++);
            //    //Map(m => m.ArtskartModel.IncludeObjects).Index(i++);
            //    //Map(m => m.ArtskartModel.IncludeObservations).Index(i++);
            //    //Map(m => m.ArtskartModel.IncludeNorge).Index(i++);
            //    //Map(m => m.ArtskartModel.IncludeSvalbard).Index(i++);

            //    ////Map(m => m.LockedForEditAt).Index(i++);
            //    ////Map(m => m.LockedForEditBy).Index(i++);
            //    //Map(m => m.EvaluationStatus).Index(i++);
            //    //Map(m => m.PopularName).Index(i++).Name("NorskNavn");
            //    //Map(m => m.Kommentarer).Index(i++);
            //    //Map(m => m.Tilbakemeldinger).Index(i++);
            //    //Map(m => m.WktPolygon).Index(i++);
            //    //Map(m => m.ArtskartSelectionGeometry).Index(i++);
            //    ////Map(m => m.SistVurdertAr).Index(i++);
            //    //Map(m => m.Slettet).Index(i++);
            //    ////Map(m => m.ImportInfo.VurderingsId2015).Index(i++);
            //    ////Map(m => m.ImportInfo.OrgVitenskapeligNavnId).Index(i++);
            //    ////Map(m => m.ImportInfo.OrgVitenskapeligNavn).Index(i++);
            //    //Map(m => m.ImportInfo.Url2015).Index(i++);
            //    ////Map(m => m.ImportInfo.Kategori2015).Index(i++);
            //    //Map(m => m.ImportInfo.Kriterier2015).Index(i++);
            //    //Map(m => m.ImportInfo.ScientificNameId2015).Index(i++);
            //    //Map(m => m.ImportInfo.ScientificName2015).Index(i++);
            //    //Map(m => m.ImportInfo.MultipleUrl2015).Index(i++);
            //    //Map(m => m.ImportInfo.VurderingsId2010).Index(i++);
            //    //Map(m => m.ImportInfo.Url2010).Index(i++);
            //    //Map(m => m.ImportInfo.Kategori2010).Index(i++);
            //    //Map(m => m.ImportInfo.Kriterier2010).Index(i++);
            //    //Map(m => m.ImportInfo.ScientificNameId2010).Index(i++);
            //    //Map(m => m.ImportInfo.ScientificName2010).Index(i++);
            //    //Map(m => m.ImportInfo.MultipleUrl2010).Index(i++);
            //    //Map(m => m.ImportInfo.VurderingsId2015Databank).Index(i++);
            //    //Map(m => m.NaturtypeHovedenhet).Index(i++).Name("Hovedhabitat");
            //    //Map().Index(i++).Name("Øs").ConvertUsing(rl => GetFylkesStatus(rl, "Øs"));
            //    //Map().Index(i++).Name("Oa").ConvertUsing(rl => GetFylkesStatus(rl, "OsA"));
            //    //Map().Index(i++).Name("He").ConvertUsing(rl => GetFylkesStatus(rl, "He"));
            //    //Map().Index(i++).Name("Op").ConvertUsing(rl => GetFylkesStatus(rl, "Op"));
            //    //Map().Index(i++).Name("Bu").ConvertUsing(rl => GetFylkesStatus(rl, "Bu"));

            //    //Map().Index(i++).Name("Ve").ConvertUsing(rl => GetFylkesStatus(rl, "Ve"));
            //    //Map().Index(i++).Name("Te").ConvertUsing(rl => GetFylkesStatus(rl, "Te"));

            //    //Map().Index(i++).Name("Aa").ConvertUsing(rl => GetFylkesStatus(rl, "Aa"));

            //    //Map().Index(i++).Name("Va").ConvertUsing(rl => GetFylkesStatus(rl, "Va"));

            //    //Map().Index(i++).Name("Ro").ConvertUsing(rl => GetFylkesStatus(rl, "Ro"));

            //    //Map().Index(i++).Name("Ho").ConvertUsing(rl => GetFylkesStatus(rl, "Ho"));

            //    //Map().Index(i++).Name("Sf").ConvertUsing(rl => GetFylkesStatus(rl, "Sf"));

            //    //Map().Index(i++).Name("Mr").ConvertUsing(rl => GetFylkesStatus(rl, "Mr"));

            //    //Map().Index(i++).Name("Tø").ConvertUsing(rl => GetFylkesStatus(rl, "Tø"));
            //    //Map().Index(i++).Name("No").ConvertUsing(rl => GetFylkesStatus(rl, "No"));

            //    //Map().Index(i++).Name("Tr").ConvertUsing(rl => GetFylkesStatus(rl, "Tr"));

            //    //Map().Index(i++).Name("Fi").ConvertUsing(rl => GetFylkesStatus(rl, "Fi"));

            //    //Map().Index(i++).Name("Gh").ConvertUsing(rl => GetFylkesStatus(rl, "Gh"));
            //    //Map().Index(i++).Name("Bs").ConvertUsing(rl => GetFylkesStatus(rl, "Bs"));
            //    //Map().Index(i++).Name("Bn").ConvertUsing(rl => GetFylkesStatus(rl, "Bn"));
            //    //Map().Index(i++).Name("Nh").ConvertUsing(rl => GetFylkesStatus(rl, "Nh"));
            //    //Map().Index(i++).Name("Ns").ConvertUsing(rl => GetFylkesStatus(rl, "Ns"));
            //    //Map().Index(i++).Name("Påvirkningsfaktorer").ConvertUsing(rl => PavirkningsfaktorListConverter(rl));
            //    ////Map(m => m.Påvirkningsfaktorer).Index(i++);

            //    //Map(m => m.Påvirkningsfaktorer).Index(i++).ConvertUsing(o => o.Påvirkningsfaktorer != null ? o.Påvirkningsfaktorer.Count.ToString() : "").Name("AntallPåvirkningsfaktorer");

            //    //Map(x => x.Referanser).Index(i++).ConvertUsing(o => o.Referanser != null ? o.Referanser.Count.ToString(): "");
            //    //Map(m => m.NewestCommentDate).Index(i++);
            //    //Map(m => m.CommentOpen).Index(i++);
            //    //Map(m => m.CommentClosed).Index(i++);
            //    //Map(m => m.TaxonChange).Index(i++);

            //}

            private string ConvertToStringFunction(ConvertToStringArgs<FA4WithComments> args)
            {
                var ass = args.Value;
                var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
                if (ass2018 == null) return "NR2018";

                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "canNotEstablishWithin50years")
                    return "notEstablishedWithin50Years";
                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "traditionalProductionSpecie")
                    return "traditionalProductionSpecie";
                if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")
                    return "notAssessedDoorKnocker";
                return "assessed";
            }
            
        }

        //private static string GetFylkesStatus(object rl, string item)
        //{
        //    FA3 o = (FA3WithComments) rl;
        //    var fylkesforekomsts = o.Fylkesforekomster.FirstOrDefault(x => x.Fylke == item);
        //    if (fylkesforekomsts == null)
        //    {
        //        return string.Empty;
        //    }

        //    switch (fylkesforekomsts.State)
        //    {
        //        case 0: return "kjent";
        //        case 1: return "antatt";
        //        case 2: return "ikkeKjent";
        //        case 3: return "antatt utdødd";
        //        case 4: return "utdødd";
        //    }

        //    return "feil";
        //}

        //private static string GetAarsakTilNedgraderingAvKategoritekst(object rl)
        //{
        //    var o = (FA3WithComments)rl;
        //    return o.UtdøingSterktPåvirket == "Ja" ? o.ÅrsakTilNedgraderingAvKategori ?? "" : "";
        //}

        //internal class CustomMinMaxProbableIntervallConverter : ITypeConverter
        //{
        //    public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
        //    {
        //        var thing = (Rodliste2019.MinMaxProbableIntervall) value;
        //        if (thing == null || (string.IsNullOrWhiteSpace(thing.Min)) &&
        //            string.IsNullOrWhiteSpace(thing.Max) && string.IsNullOrWhiteSpace(thing.Probable) &&
        //            string.IsNullOrWhiteSpace(thing.Quantile) && string.IsNullOrWhiteSpace(thing.Maxintervall) &&
        //            string.IsNullOrWhiteSpace(thing.Minintervall))
        //        {
        //            return string.Empty;
        //        }

        //        return
        //            $"min: {thing.Min} max: {thing.Max} probable:{thing.Probable} quantile:{thing.Quantile} minintervall:{thing.Minintervall} maxintervall:{thing.Maxintervall} punktestimat:{thing.Punktestimat}";
        //    }

        //    public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
        //    {
        //        throw new NotImplementedException();
        //    }
        //}

        //internal class CustomMinMaxProbableConverter : ITypeConverter
        //{
        //    public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
        //    {
        //        var thing = (Rodliste2019.MinMaxProbable) value;
        //        if (thing == null || (string.IsNullOrWhiteSpace(thing.Min)) &&
        //            string.IsNullOrWhiteSpace(thing.Max) && string.IsNullOrWhiteSpace(thing.Probable) &&
        //            string.IsNullOrWhiteSpace(thing.Quantile))
        //        {
        //            return string.Empty;
        //        }

        //        return $"min: {thing.Min} max: {thing.Max} probable:{thing.Probable} quantile:{thing.Quantile}";
        //    }

        //    public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
        //    {
        //        throw new NotImplementedException();
        //    }
        //}

        internal class CustomStringListConverter : ITypeConverter
        {
            public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
            {
                var thing = (List<string>) value;
                if (thing == null || thing.Count == 0)
                {
                    return string.Empty;
                }

                return string.Join(", ", thing);
            }

            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                throw new NotImplementedException();
            }
        }

        internal class CustomStringArrayConverter : ITypeConverter
        {
            public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
            {
                var thing = (string[]) value;
                if (thing == null || thing.Length == 0)
                {
                    return string.Empty;
                }

                return string.Join(", ", thing);
            }

            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                throw new NotImplementedException();
            }
        }

        internal class CustomStringConverter : ITypeConverter
        {
            private const char Newline = '\n';

            public virtual string ConvertToString(
                object value,
                IWriterRow row,
                MemberMapData memberMapData)
            {
                if (value == null)
                    return string.Empty;
                if (!(value is IFormattable formattable))
                {
                    if (((string) value).Contains(Newline))
                    {
                        value = Regex.Replace(((string) value), "/(\\r\\n)+|\\r+|\\n+|\\t+/i", " ");
                    }

                    if (((string) value).Contains('<'))
                    {
                        value = Regex.Replace(((string) value), @"<.*?>", string.Empty);
                    }

                    if (((string) value).Contains("&nbsp;"))
                    {
                        value = ((string) value).Replace("&nbsp;", " ");
                    }

                    if (((string) value).Contains("&amp;"))
                    {
                        value = ((string) value).Replace("&amp;", "&");
                    }

                    return ((string) value).Contains("&")
                        ? WebUtility.HtmlDecode(value.ToString()).Trim()
                        : value.ToString().Trim();
                }

                string[] formats = memberMapData.TypeConverterOptions.Formats;
                string format = formats != null
                    ? ((IEnumerable<string>) formats).FirstOrDefault<string>()
                    : (string) null;
                return formattable.ToString(format,
                    (IFormatProvider) memberMapData.TypeConverterOptions.CultureInfo);
            }

            /// <summary>
            /// Converts the string to an object.
            /// </summary>
            /// <param name="text">The string to convert to an object.</param>
            /// <param name="row">The <see cref="IReaderRow"/> for the current record.</param>
            /// <param name="memberMapData">The <see cref="MemberMapData"/> for the member being created.</param>
            /// <returns>The object created from the string.</returns>
            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                if (text == null)
                    return (object) string.Empty;
                foreach (string nullValue in memberMapData.TypeConverterOptions.NullValues)
                {
                    if (text == nullValue)
                        return (object) null;
                }

                return (object) text;
            }
        }

        //public class CustomPavirkningsfaktorListConverter : ITypeConverter
        //{
        //    public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
        //    {
        //        var thing = (List<Rodliste2019.Pavirkningsfaktor>)value;
        //        if (thing == null || thing.Count == 0)
        //        {
        //            return string.Empty;
        //        }

        //        var simpleList = thing.Select(pavirkningsfaktor => $"{pavirkningsfaktor.OverordnetTittel}").ToList();

        //        return string.Join(", ", simpleList);
        //    }

        //    public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
        //    {
        //        throw new NotImplementedException();
        //    }
        //}

        //public static string PavirkningsfaktorListConverter(object rl)
        //{
        //    Rodliste2019 o = (FA3WithComments) rl;

        //    var thing = o.Påvirkningsfaktorer;
        //        if (thing == null || thing.Count == 0)
        //    {
        //        return string.Empty;
        //    }

        //    var simpleList = thing.Select(pavirkningsfaktor => $"{pavirkningsfaktor.OverordnetTittel} > {pavirkningsfaktor.Beskrivelse}_{pavirkningsfaktor.Tidspunkt}_{pavirkningsfaktor.Omfang}_{pavirkningsfaktor.Alvorlighetsgrad}").ToList();

        //        return string.Join(";", simpleList);

        //}

        public class CustomDateTimeConverter : ITypeConverter
        {
            public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
            {
                if (value == null)
                {
                    return string.Empty;
                }

                var thing = (DateTime) value;

                return thing.ToString("yyyy.MM.dd");
            }

            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                throw new NotImplementedException();
            }
        }
    }
}
