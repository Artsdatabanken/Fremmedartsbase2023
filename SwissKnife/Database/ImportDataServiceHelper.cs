using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection.PortableExecutable;
using System.Text.Json;
using System.Text.Json.Nodes;
using AutoMapper;
using CsvHelper;
using CsvHelper.Configuration;
using KellermanSoftware.CompareNetObjects;
using McMaster.Extensions.CommandLineUtils;
using Prod.Domain;
using Prod.Domain.Legacy;
using SwissKnife.Database.CsvModels;
using SwissKnife.Models;
using MigrationPathway = Prod.Domain.MigrationPathway;
using RiskAssessment = Prod.Domain.RiskAssessment;

namespace SwissKnife.Database;

internal static class ImportDataServiceHelper
{
    /// <summary>
    ///     Update info on misIdentified from imported dataset
    /// </summary>
    public static void FixMisIdentified(FA4 fa4, Dictionary<int, MisIdentifiedData> misIdentifiedDataset,
        Assessment assessment)
    {
        if (!misIdentifiedDataset.ContainsKey(assessment.Id)) return;

        var misIdentification = misIdentifiedDataset[assessment.Id];

        // bare oppdater der begrunnelse er kommet
        if (string.IsNullOrWhiteSpace(misIdentification.MisIdentifiedDescription)) return;

        fa4.MisIdentified = true;
        fa4.MisIdentifiedDescription = misIdentification.MisIdentifiedDescription;
        fa4.AlienSpeciesCategory = misIdentification.AlienSpeciesCategory;
        fa4.AssessmentConclusion = misIdentification.AssessmentConclusion;
        fa4.Category = misIdentification.Category;
        fa4.EvaluationStatus = misIdentification.EvaluationStatus;
    }

    /// <summary>
    ///     Copy set of properties from one assessment to another
    /// </summary>
    /// <param name="conf">Define which optional set of information to include </param>
    public static void TransferAssessmentInfo(TranferConfig conf, FA4 from, FA4 to, Assessment fromAssessment,
        Assessment toAssessment)
    {
        to.Category = from.Category;
        to.Citation = from.Citation;
        to.Criteria = from.Criteria;
        to.AlienSpeciesCategory = from.AlienSpeciesCategory;
        to.AssessmentConclusion = from.AssessmentConclusion;
        to.DescriptionOfReasonsForChangeOfCategory = from.DescriptionOfReasonsForChangeOfCategory;
        to.ReasonForChangeOfCategory = from.ReasonForChangeOfCategory;
        to.EvaluationStatus = from.EvaluationStatus;

        // datasett = attachments
        CopyAttachments(fromAssessment, toAssessment);

        to.Fylkesforekomster = from.Fylkesforekomster;

        if (conf.Artsegenskaper)
        {
            to.Limnic = from.Limnic;
            to.Terrestrial = from.Terrestrial;
            to.Marine = from.Marine;
            to.ArrivedCountryFrom = from.ArrivedCountryFrom;
            to.ArrivedCountryFromDetails = from.ArrivedCountryFromDetails;
            to.NaturalOrigins = from.NaturalOrigins;
            to.NaturalOriginUnknownDocumentation = from.NaturalOriginUnknownDocumentation;
            to.CurrentInternationalExistenceAreas = from.CurrentInternationalExistenceAreas;

            to.CurrentInternationalExistenceAreasUnknownDocumentation =
                from.CurrentInternationalExistenceAreasUnknownDocumentation;
            to.NaturalOriginMarine = from.NaturalOriginMarine;
            to.NaturalOriginMarineDetails = from.NaturalOriginMarineDetails;
            to.CurrentInternationalExistenceMarineAreas = from.CurrentInternationalExistenceMarineAreas;
            to.CurrentInternationalExistenceMarineAreasDetails = from.CurrentInternationalExistenceMarineAreasDetails;

            to.ReproductionAsexual = from.ReproductionAsexual;
            to.ReproductionSexual = from.ReproductionSexual;
            to.ReproductionGenerationTime = from.ReproductionGenerationTime;
        }

        to.CoastLineSections = from.CoastLineSections;
        to.CurrentBioClimateZones = from.CurrentBioClimateZones;
        to.ArcticBioClimateZones = from.ArcticBioClimateZones;

        if (conf.Spredningsveier)
        {
            to.ImportPathways = from.ImportPathways;
            to.IndoorProduktion = from.IndoorProduktion;
            to.AssesmentVectors = from.AssesmentVectors;

            to.SpreadIndoorFurtherInfo = from.SpreadIndoorFurtherInfo;
            to.SpreadIntroductionFurtherInfo = from.SpreadIntroductionFurtherInfo;
            to.SpreadFurtherSpreadFurtherInfo = from.SpreadFurtherSpreadFurtherInfo;
        }

        to.CurrentPresenceComment = from.CurrentPresenceComment;
        to.SpeciesEstablishmentCategory = from.SpeciesEstablishmentCategory;
        to.ImpactedNatureTypes = from.ImpactedNatureTypes;
        to.Habitats = from.Habitats;

        var riskAssessmentClone =
            JsonSerializer.Deserialize<RiskAssessment>(JsonSerializer.Serialize(from.RiskAssessment),
                ImportDataService._jsonSerializerOptions);
        Debug.Assert(riskAssessmentClone != null, nameof(riskAssessmentClone) + " != null");
        if (conf.ArtsStatus)
        {
            // kopierer da hele riskAssesment +
            to.ProductionSpecies = from.ProductionSpecies;
            to.ProductionSpeciesDescription = from.ProductionSpeciesDescription;
            to.UncertainityEstablishmentTimeDescription = from.UncertainityEstablishmentTimeDescription;
            to.UncertainityStatusDescription = from.UncertainityStatusDescription;
            to.AlienSpecieUncertainIfEstablishedBefore1800 = from.AlienSpecieUncertainIfEstablishedBefore1800;
            to.UncertainityEstablishmentTimeDescription = from.UncertainityEstablishmentTimeDescription;
            to.FurtherInfo = from.FurtherInfo;
        }
        else
        {

            // kopierer da hele riskAssesment minus feltene under som beholdes
            var ra = to.RiskAssessment;

            riskAssessmentClone.YearFirstIndoors = ra.YearFirstIndoors;
            riskAssessmentClone.YearFirstIndoorsInsecure = ra.YearFirstIndoorsInsecure;
            riskAssessmentClone.YearFirstReproductionIndoors = ra.YearFirstReproductionIndoors;
            riskAssessmentClone.YearFirstReproductionIndoorsInsecure = ra.YearFirstReproductionIndoorsInsecure;
            riskAssessmentClone.YearFirstProductionOutdoors = ra.YearFirstProductionOutdoors;
            riskAssessmentClone.YearFirstProductionOutdoorsInsecure = ra.YearFirstProductionOutdoorsInsecure;
            riskAssessmentClone.YearFirstReproductionOutdoors = ra.YearFirstReproductionOutdoors;
            riskAssessmentClone.YearFirstReproductionOutdoorsInsecure = ra.YearFirstReproductionOutdoorsInsecure;
            riskAssessmentClone.YearFirstEstablishmentProductionArea = ra.YearFirstEstablishmentProductionArea;
            riskAssessmentClone.YearFirstEstablishmentProductionAreaInsecure =
                ra.YearFirstEstablishmentProductionAreaInsecure;
            riskAssessmentClone.YearFirstNature = ra.YearFirstNature;
            riskAssessmentClone.YearFirstNatureInsecure = ra.YearFirstNatureInsecure;
            riskAssessmentClone.YearFirstReproductionNature = ra.YearFirstReproductionNature;
            riskAssessmentClone.YearFirstReproductionNatureInsecure = ra.YearFirstReproductionNatureInsecure;
            riskAssessmentClone.YearFirstEstablishedNature = ra.YearFirstEstablishedNature;
            riskAssessmentClone.YearFirstEstablishedNatureInsecure = ra.YearFirstEstablishedNatureInsecure;
            riskAssessmentClone.YearFirstDomesticObservation = ra.YearFirstDomesticObservation;
            //riskAssessmentClone.furt
        }

        to.RiskAssessment = riskAssessmentClone;

        to.SpeciesStatus = from.SpeciesStatus;

        to.References = from.References;
        to.ArtskartManuellKommentar = from.ArtskartManuellKommentar;

        to.ConnectedTaxon = new CTaxon()
        {
            TaxonID = from.TaxonId,
            TaxonRank = from.EvaluatedScientificNameRank,
            ScientificName = from.EvaluatedScientificName,
            ScientificNameId = (int)from.EvaluatedScientificNameId,
            AssessmentId = from.Id
        };
    }


    /// <summary>
    ///     Replicate - copy attachments from one assessment to another. Deleting other attachment on destination
    /// </summary>
    private static void CopyAttachments(Assessment fromAssessment, Assessment toAssessment)
    {
        foreach (var assessmentAttachment in toAssessment.Attachments) assessmentAttachment.IsDeleted = true;

        var assessmentAttachments = fromAssessment.Attachments.Where(x => x.IsDeleted == false).ToArray();
        foreach (var attachment in assessmentAttachments)
            toAssessment.Attachments.Add(new Attachment
            {
                Date = attachment.Date,
                Description = attachment.Description,
                File = attachment.File,
                FileName = attachment.FileName,
                IsDeleted = attachment.IsDeleted,
                Name = attachment.Name,
                Type = attachment.Type,
                UserId = attachment.UserId
            });
    }

    /// <summary>
    ///     Transform Fab3 assessment to Fab4 assessment
    /// </summary>
    public static FA4 TransformFromFa3ToFa4(FA3Legacy fa3, Mapper mapper)
    {
        var fa4 = mapper.Map<FA4>(fa3);

        return fa4;
    }

    /// <summary>
    ///     Cumulative set of fixes after first transform - not all should be applied after work has started
    /// </summary>
    public static void FixPropertiesOnNewAssessments(FA4 exAssessment)
    {
        exAssessment.ArtskartModel ??= new ArtskartModel();
        exAssessment.ArtskartWaterModel ??= new ArtskartWaterModel();
        exAssessment.ImpactedNatureTypesFrom2018 ??= new List<FA4.ImpactedNatureType>();

        if (exAssessment.ExpertGroup == "Sopper")
            if (exAssessment.TaxonHierarcy.ToLowerInvariant().StartsWith("chromista"))
                exAssessment.ExpertGroup = "Kromister";

        if (exAssessment.Fylkesforekomster.All(x => x.Fylke != "St"))
            exAssessment.Fylkesforekomster.Add(new Fylkesforekomst { Fylke = "St" });
        if (exAssessment.Fylkesforekomster.All(x => x.Fylke != "Nt"))
            exAssessment.Fylkesforekomster.Add(new Fylkesforekomst { Fylke = "Nt" });

        if (exAssessment.HorizonEcologicalEffect != null &&
            exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yeswhilepresent" &&
            exAssessment.HorizonEcologicalEffect != "yesWhilePresent")
            exAssessment.HorizonEcologicalEffect = "yesWhilePresent";
        if (exAssessment.HorizonEcologicalEffect != null &&
            exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "no" &&
            exAssessment.HorizonEcologicalEffect != "no")
            exAssessment.HorizonEcologicalEffect = "no";
        if (exAssessment.HorizonEcologicalEffect != null &&
            exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yesaftergone" &&
            exAssessment.HorizonEcologicalEffect != "yesAfterGone")
            exAssessment.HorizonEcologicalEffect = "yesAfterGone";

        if (exAssessment.HorizonScanResult == "scanned_fullAssessment")
        {
            if (exAssessment.HorizonEstablismentPotential == "0")
                exAssessment.RiskAssessment.Occurrences1Best = 0;
            else if (exAssessment.HorizonEstablismentPotential == "1") exAssessment.RiskAssessment.Occurrences1Best = 1;
        }

        if (exAssessment.HorizonScanResult == "scanned_fullAssessment") exAssessment.IsAlienSpecies = true;

        if (!string.IsNullOrWhiteSpace(exAssessment.IsAlien))
        {
            //console.WriteLine("denneisalien:" + exAssessment.ExpertGroup + ":" + exAssessment.EvaluatedScientificName);
        }

        if (exAssessment.IsAlienSpecies.HasValue && exAssessment.IsAlienSpecies.Value == false)
        {
            exAssessment.IsAlien = exAssessment.AssesmentNotApplicableDescription;

            var obsTekster = new List<Tuple<string, string, string>>();
            if (!string.IsNullOrWhiteSpace(exAssessment.IsAlien))
                obsTekster.Add(new Tuple<string, string, string>(exAssessment.ExpertGroup,
                    exAssessment.EvaluatedScientificName, "pot overskrev: " + exAssessment.IsAlien));
        }
    }

    /// <summary>
    ///     Fix existing assessments - based on info from fresh transform and changes in autoMapper
    /// </summary>
    public static void TransferAndFixPropertiesOnAssessmentsFrom2018(FA4 liveAssessment, FA4 newlyTransformedAssesment)
    {
        liveAssessment.SpreadHistory = newlyTransformedAssesment.SpreadHistory;

        liveAssessment.RegionalPresenceKnown = newlyTransformedAssesment.RegionalPresenceKnown;
        liveAssessment.RegionalPresenceAssumed = newlyTransformedAssesment.RegionalPresenceAssumed;
        liveAssessment.RegionalPresencePotential = newlyTransformedAssesment.RegionalPresencePotential;
        liveAssessment.Fylkesforekomster = newlyTransformedAssesment.Fylkesforekomster;

        //map fix

        liveAssessment.RiskAssessment.AOOknownInput = newlyTransformedAssesment.RiskAssessment.AOOknownInput;
        liveAssessment.RiskAssessment.AOOknown = newlyTransformedAssesment.RiskAssessment.AOOknown;
        liveAssessment.RiskAssessment.AOOknown1 = newlyTransformedAssesment.RiskAssessment.AOOknown1;
        liveAssessment.RiskAssessment.AOOknown2 = newlyTransformedAssesment.RiskAssessment.AOOknown2;
        liveAssessment.RiskAssessment.AOOtotalBestInput = newlyTransformedAssesment.RiskAssessment.AOOtotalBestInput;
        liveAssessment.RiskAssessment.AOOtotalBest = newlyTransformedAssesment.RiskAssessment.AOOtotalBest;
        liveAssessment.RiskAssessment.AOOtotalLowInput = newlyTransformedAssesment.RiskAssessment.AOOtotalLowInput;
        liveAssessment.RiskAssessment.AOOtotalLow = newlyTransformedAssesment.RiskAssessment.AOOtotalLow;
        liveAssessment.RiskAssessment.AOOtotalHighInput = newlyTransformedAssesment.RiskAssessment.AOOtotalHighInput;
        liveAssessment.RiskAssessment.AOOtotalHigh = newlyTransformedAssesment.RiskAssessment.AOOtotalHigh;
        liveAssessment.RiskAssessment.AOO50yrBestInput = newlyTransformedAssesment.RiskAssessment.AOO50yrBestInput;
        liveAssessment.RiskAssessment.AOO50yrBest = newlyTransformedAssesment.RiskAssessment.AOO50yrBest;
        liveAssessment.RiskAssessment.AOO50yrLowInput = newlyTransformedAssesment.RiskAssessment.AOO50yrLowInput;
        liveAssessment.RiskAssessment.AOO50yrLow = newlyTransformedAssesment.RiskAssessment.AOO50yrLow;
        liveAssessment.RiskAssessment.AOO50yrHighInput = newlyTransformedAssesment.RiskAssessment.AOO50yrHighInput;
        liveAssessment.RiskAssessment.AOO50yrHigh = newlyTransformedAssesment.RiskAssessment.AOO50yrHigh;
        liveAssessment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes =
            newlyTransformedAssesment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;


        liveAssessment.RiskAssessment.ChosenSpreadYearlyIncrease =
            newlyTransformedAssesment.RiskAssessment.ChosenSpreadYearlyIncrease;
        liveAssessment.RiskAssessment.ExpansionSpeedInput =
            newlyTransformedAssesment.RiskAssessment.ExpansionSpeedInput;
        liveAssessment.RiskAssessment.ExpansionUpperQInput =
            newlyTransformedAssesment.RiskAssessment.ExpansionUpperQInput;
        liveAssessment.RiskAssessment.ExpansionLowerQInput =
            newlyTransformedAssesment.RiskAssessment.ExpansionLowerQInput;

        liveAssessment.RiskAssessment.AOOdarkfigureBest = newlyTransformedAssesment.RiskAssessment.AOOdarkfigureBest;
        liveAssessment.RiskAssessment.AOOdarkfigureHigh = newlyTransformedAssesment.RiskAssessment.AOOdarkfigureHigh;
        liveAssessment.RiskAssessment.AOOdarkfigureLow = newlyTransformedAssesment.RiskAssessment.AOOdarkfigureLow;


        liveAssessment.IsAlienSpecies = newlyTransformedAssesment.IsAlienSpecies;
        liveAssessment.ConnectedToAnother = newlyTransformedAssesment.ConnectedToAnother;
        liveAssessment.ProductionSpecies = liveAssessment.ProductionSpecies is true
            ? true
            : newlyTransformedAssesment.ProductionSpecies;
        liveAssessment.AlienSpecieUncertainIfEstablishedBefore1800 =
            newlyTransformedAssesment.AlienSpecieUncertainIfEstablishedBefore1800;
        liveAssessment.IsRegionallyAlien = newlyTransformedAssesment.IsRegionallyAlien;
        liveAssessment.IsAlienSpecies = newlyTransformedAssesment.IsAlienSpecies;
        liveAssessment.ConnectedToAnother = newlyTransformedAssesment.ConnectedToAnother;

        liveAssessment.RiskAssessment.SpeciesSpeciesInteractions =
            newlyTransformedAssesment.RiskAssessment.SpeciesSpeciesInteractions;
        liveAssessment.RiskAssessment.SpeciesNaturetypeInteractions =
            newlyTransformedAssesment.RiskAssessment.SpeciesNaturetypeInteractions;
        liveAssessment.RiskAssessment.SpeciesNaturetypeInteractions2018 =
            newlyTransformedAssesment.RiskAssessment.SpeciesNaturetypeInteractions2018;
        liveAssessment.RiskAssessment.HostParasiteInformations =
            newlyTransformedAssesment.RiskAssessment.HostParasiteInformations;
        liveAssessment.RiskAssessment.GeneticTransferDocumented =
            newlyTransformedAssesment.RiskAssessment.GeneticTransferDocumented;

        liveAssessment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes =
            newlyTransformedAssesment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

        liveAssessment.RiskAssessment.YearFirstIndoors = newlyTransformedAssesment.RiskAssessment.YearFirstIndoors;
        liveAssessment.RiskAssessment.YearFirstIndoorsInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstIndoorsInsecure;
        liveAssessment.RiskAssessment.YearFirstReproductionIndoors =
            newlyTransformedAssesment.RiskAssessment.YearFirstReproductionIndoors;
        liveAssessment.RiskAssessment.YearFirstReproductionIndoorsInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstReproductionIndoorsInsecure;
        liveAssessment.RiskAssessment.YearFirstProductionOutdoors =
            newlyTransformedAssesment.RiskAssessment.YearFirstProductionOutdoors;
        liveAssessment.RiskAssessment.YearFirstProductionOutdoorsInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstProductionOutdoorsInsecure;
        liveAssessment.RiskAssessment.YearFirstReproductionOutdoors =
            newlyTransformedAssesment.RiskAssessment.YearFirstReproductionOutdoors;
        liveAssessment.RiskAssessment.YearFirstReproductionOutdoorsInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstReproductionOutdoorsInsecure;
        liveAssessment.RiskAssessment.YearFirstEstablishmentProductionArea =
            newlyTransformedAssesment.RiskAssessment.YearFirstEstablishmentProductionArea;
        liveAssessment.RiskAssessment.YearFirstEstablishmentProductionAreaInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstEstablishmentProductionAreaInsecure;
        liveAssessment.RiskAssessment.YearFirstNature = newlyTransformedAssesment.RiskAssessment.YearFirstNature;
        liveAssessment.RiskAssessment.YearFirstNatureInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstNatureInsecure;
        liveAssessment.RiskAssessment.YearFirstReproductionNature =
            newlyTransformedAssesment.RiskAssessment.YearFirstReproductionNature;
        liveAssessment.RiskAssessment.YearFirstReproductionNatureInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstReproductionNatureInsecure;
        liveAssessment.RiskAssessment.YearFirstEstablishedNature =
            newlyTransformedAssesment.RiskAssessment.YearFirstEstablishedNature;
        liveAssessment.RiskAssessment.YearFirstEstablishedNatureInsecure =
            newlyTransformedAssesment.RiskAssessment.YearFirstEstablishedNatureInsecure;

        liveAssessment.RiskAssessment.ExpansionUpperQInput =
            newlyTransformedAssesment.RiskAssessment.ExpansionUpperQInput;
        liveAssessment.RiskAssessment.ExpansionLowerQInput =
            newlyTransformedAssesment.RiskAssessment.ExpansionLowerQInput;
        liveAssessment.RiskAssessment.ExpansionSpeedInput =
            newlyTransformedAssesment.RiskAssessment.ExpansionSpeedInput;


        liveAssessment.RiskAssessment.ROAscore2018 = newlyTransformedAssesment.RiskAssessment.ROAscore2018;

        //if (exAssessment.ExpertGroup != newlyTransformedAssesment.ExpertGroup)
        //{
        //    if (exAssessment.HorizonDoScanning)
        //    {

        //    }
        //}
        liveAssessment.ExpertGroup = newlyTransformedAssesment.ExpertGroup;

        if (liveAssessment.ExpertGroup == "Sopper")
            if (liveAssessment.TaxonHierarcy.ToLowerInvariant().StartsWith("chromista"))
                liveAssessment.ExpertGroup = "Kromister";

        if (newlyTransformedAssesment.IsDeleted && !liveAssessment.IsDeleted) liveAssessment.IsDeleted = true;


        liveAssessment.AssesmentVectors = newlyTransformedAssesment.AssesmentVectors;

        liveAssessment.ImpactedNatureTypes = newlyTransformedAssesment.ImpactedNatureTypes;
        liveAssessment.ImpactedNatureTypesFrom2018 = newlyTransformedAssesment.ImpactedNatureTypesFrom2018;
        liveAssessment.Habitats = newlyTransformedAssesment.Habitats;

        liveAssessment.ArtskartModel = newlyTransformedAssesment.ArtskartModel;
        liveAssessment.ArtskartWaterModel = newlyTransformedAssesment.ArtskartWaterModel;
        if (liveAssessment.Fylkesforekomster.All(x => x.Fylke != "St"))
            liveAssessment.Fylkesforekomster.Add(new Fylkesforekomst { Fylke = "St" });
        if (liveAssessment.Fylkesforekomster.All(x => x.Fylke != "Nt"))
            liveAssessment.Fylkesforekomster.Add(new Fylkesforekomst { Fylke = "Nt" });
        liveAssessment.RiskAssessment.Criteria = newlyTransformedAssesment.RiskAssessment.Criteria;

        if (liveAssessment.HorizonEcologicalEffect != null &&
            liveAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yeswhilepresent" &&
            liveAssessment.HorizonEcologicalEffect != "yesWhilePresent")
            liveAssessment.HorizonEcologicalEffect = "yesWhilePresent";
        if (liveAssessment.HorizonEcologicalEffect != null &&
            liveAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "no" &&
            liveAssessment.HorizonEcologicalEffect != "no")
            liveAssessment.HorizonEcologicalEffect = "no";
        if (liveAssessment.HorizonEcologicalEffect != null &&
            liveAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yesaftergone" &&
            liveAssessment.HorizonEcologicalEffect != "yesAfterGone")
            liveAssessment.HorizonEcologicalEffect = "yesAfterGone";

        liveAssessment.RiskAssessment.Occurrences1Best = newlyTransformedAssesment.RiskAssessment.Occurrences1Best;
        liveAssessment.RiskAssessment.Occurrences1High = newlyTransformedAssesment.RiskAssessment.Occurrences1High;
        liveAssessment.RiskAssessment.Occurrences1Low = newlyTransformedAssesment.RiskAssessment.Occurrences1Low;

        if (liveAssessment.HorizonScanResult == "scanned_fullAssessment")
        {
            if (liveAssessment.HorizonEstablismentPotential == "0")
                liveAssessment.RiskAssessment.Occurrences1Best = 0;
            else if (liveAssessment.HorizonEstablismentPotential == "1")
                liveAssessment.RiskAssessment.Occurrences1Best = 1;
        }

        liveAssessment.AssesmentVectors = newlyTransformedAssesment.AssesmentVectors;
        liveAssessment.RiskAssessment.DemVariance = newlyTransformedAssesment.RiskAssessment.DemVariance;
        liveAssessment.RiskAssessment.EnvVariance = newlyTransformedAssesment.RiskAssessment.EnvVariance;

        //prod 16.02.2020
        if (liveAssessment.HorizonScanResult == "scanned_fullAssessment") liveAssessment.IsAlienSpecies = true;

        liveAssessment.PreviousAssessments = newlyTransformedAssesment.PreviousAssessments;

        liveAssessment.IndoorProduktion = newlyTransformedAssesment.IndoorProduktion;
        liveAssessment.SpreadIntroductionFurtherInfo = newlyTransformedAssesment.SpreadIntroductionFurtherInfo;

        liveAssessment.RiskAssessment.SpeciesSpeciesInteractions =
            newlyTransformedAssesment.RiskAssessment.SpeciesSpeciesInteractions;
        liveAssessment.RiskAssessment.HostParasiteInformations =
            newlyTransformedAssesment.RiskAssessment.HostParasiteInformations;
        liveAssessment.RiskAssessment.GeneticTransferDocumented =
            newlyTransformedAssesment.RiskAssessment.GeneticTransferDocumented;
        liveAssessment.RiskAssessment.SpeciesNaturetypeInteractions =
            newlyTransformedAssesment.RiskAssessment.SpeciesNaturetypeInteractions;
        liveAssessment.RiskAssessment.SpeciesNaturetypeInteractions2018 =
            newlyTransformedAssesment.RiskAssessment.SpeciesNaturetypeInteractions2018;


        var obsTekster = new List<Tuple<string, string, string>>();
        if (!string.IsNullOrWhiteSpace(liveAssessment.IsAlien))
            //Console.WriteLine("denneisalien:" + exAssessment.ExpertGroup + ":" + exAssessment.EvaluatedScientificName);
            obsTekster.Add(new Tuple<string, string, string>(liveAssessment.ExpertGroup,
                liveAssessment.EvaluatedScientificName, liveAssessment.IsAlien));

        var assesmentNotApplicableDescription = newlyTransformedAssesment.AssesmentNotApplicableDescription;
        if (!string.IsNullOrWhiteSpace(liveAssessment.AssesmentNotApplicableDescription) &&
            liveAssessment.AssesmentNotApplicableDescription !=
            newlyTransformedAssesment.AssesmentNotApplicableDescription)
        {
            assesmentNotApplicableDescription = liveAssessment.AssesmentNotApplicableDescription;
            obsTekster.Add(new Tuple<string, string, string>(liveAssessment.ExpertGroup,
                liveAssessment.EvaluatedScientificName, assesmentNotApplicableDescription));
        }
        else if (string.IsNullOrWhiteSpace(liveAssessment.AssesmentNotApplicableDescription) &&
                 !string.IsNullOrWhiteSpace(newlyTransformedAssesment.AssesmentNotApplicableDescription))
        {
            obsTekster.Add(new Tuple<string, string, string>(liveAssessment.ExpertGroup,
                liveAssessment.EvaluatedScientificName, assesmentNotApplicableDescription));
        }

        if (!string.IsNullOrWhiteSpace(assesmentNotApplicableDescription))
        {
            if (newlyTransformedAssesment.AlienSpeciesCategory == "AlienSpecie" ||
                (newlyTransformedAssesment.AlienSpeciesCategory == "NotApplicable" &&
                 newlyTransformedAssesment.NotApplicableCategory == "notAlienSpecie"))
            {
                liveAssessment.IsAlien = newlyTransformedAssesment.AlienSpeciesCategory == "AlienSpecie"
                    ? string.IsNullOrWhiteSpace(newlyTransformedAssesment.AlienSpecieUncertainDescription)
                        ? assesmentNotApplicableDescription
                        : newlyTransformedAssesment.AlienSpecieUncertainDescription
                    : assesmentNotApplicableDescription;
            }
            else if ((newlyTransformedAssesment.AlienSpeciesCategory == "NotApplicable" &&
                      newlyTransformedAssesment.NotApplicableCategory == "establishedBefore1800") ||
                     (newlyTransformedAssesment.AlienSpeciesCategory == "NotApplicable" &&
                      newlyTransformedAssesment.NotApplicableCategory == "NotPresentInRegion"))
            {
                liveAssessment.UncertainityEstablishmentTimeDescription =
                    assesmentNotApplicableDescription;
            }
            else if (newlyTransformedAssesment.AlienSpeciesCategory == "NotApplicable" &&
                     newlyTransformedAssesment.NotApplicableCategory == "traditionalProductionSpecie")
            {
                liveAssessment.ProductionSpeciesDescription = assesmentNotApplicableDescription;
            }
            else if (newlyTransformedAssesment.AlienSpeciesCategory == "NotApplicable" &&
                     newlyTransformedAssesment.NotApplicableCategory == "canNotEstablishWithin50years")
            {
                if (liveAssessment.Id == 1521
                    || liveAssessment.Id == 1850
                    || liveAssessment.Id == 2062
                    || liveAssessment.Id == 2271
                    || liveAssessment.Id == 2280
                    || liveAssessment.Id == 2442
                    || liveAssessment.Id == 2467)
                    liveAssessment.UncertainityEstablishmentTimeDescription =
                        assesmentNotApplicableDescription;
                else
                    liveAssessment.UncertainityStatusDescription = assesmentNotApplicableDescription;
            }
            else if (newlyTransformedAssesment.AlienSpeciesCategory == "NotApplicable" &&
                     newlyTransformedAssesment.NotApplicableCategory == "taxonIsEvaluatedInHigherRank")
            {
                liveAssessment.ConnectedToAnotherTaxonDescription =
                    assesmentNotApplicableDescription;
            }
        }
    }

    /// <summary>
    ///     Fix Redlist for species on existing assessments
    /// </summary>
    public static void FixRedlistOnExistingAssessment(FA4 exAssessment,
        Dictionary<int, Rodliste2021Rad[]> redlistByScientificName, TaksonService taksonService)
    {
        //tryfixredlist
        foreach (var interaction in exAssessment.RiskAssessment.SpeciesSpeciesInteractions)
        {
            var currentSciId = interaction.ScientificNameId;
            if (redlistByScientificName.ContainsKey(currentSciId))
            {
                var hit = GetRegionalRedlist(redlistByScientificName, currentSciId, exAssessment.ExpertGroup);

                var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                if (interaction.RedListCategory != interactionRedListCategory)
                    interaction.RedListCategory = interactionRedListCategory;
            }
            else
            {
                var ti = taksonService.getTaxonInfo(currentSciId).GetAwaiter().GetResult();
                if (ti != null)
                    if (redlistByScientificName.ContainsKey(ti.ValidScientificNameId))
                    {
                        var hit = GetRegionalRedlist(redlistByScientificName, ti.ValidScientificNameId,
                            exAssessment.ExpertGroup);
                        var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                        if (interaction.RedListCategory != interactionRedListCategory)
                            interaction.RedListCategory = interactionRedListCategory;
                    }
                //trøbbel
            }
        }

        foreach (var interaction in exAssessment.RiskAssessment.HostParasiteInformations)
        {
            var currentSciId = interaction.ScientificNameId;
            if (redlistByScientificName.ContainsKey(currentSciId))
            {
                var hit = GetRegionalRedlist(redlistByScientificName, currentSciId, exAssessment.ExpertGroup);
                var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                if (interaction.RedListCategory != interactionRedListCategory)
                    interaction.RedListCategory = interactionRedListCategory;
            }
            else
            {
                var ti = taksonService.getTaxonInfo(currentSciId).GetAwaiter().GetResult();
                if (ti != null)
                    if (redlistByScientificName.ContainsKey(ti.ValidScientificNameId))
                    {
                        var hit = GetRegionalRedlist(redlistByScientificName, ti.ValidScientificNameId,
                            exAssessment.ExpertGroup);
                        var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                        if (interaction.RedListCategory != interactionRedListCategory)
                            interaction.RedListCategory = interactionRedListCategory;
                    }
                //trøbbel
            }
        }

        foreach (var interaction in exAssessment.RiskAssessment.GeneticTransferDocumented)
        {
            var currentSciId = interaction.ScientificNameId;
            if (redlistByScientificName.ContainsKey(currentSciId))
            {
                var hit = GetRegionalRedlist(redlistByScientificName, currentSciId, exAssessment.ExpertGroup);
                var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                if (interaction.RedListCategory != interactionRedListCategory)
                    interaction.RedListCategory = interactionRedListCategory;
            }
            else
            {
                var ti = taksonService.getTaxonInfo(currentSciId).GetAwaiter().GetResult();
                if (ti != null)
                {
                    if (redlistByScientificName.ContainsKey(ti.ValidScientificNameId))
                    {
                        var hit = GetRegionalRedlist(redlistByScientificName, ti.ValidScientificNameId,
                            exAssessment.ExpertGroup);
                        var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                        if (interaction.RedListCategory != interactionRedListCategory)
                            interaction.RedListCategory = interactionRedListCategory;
                    }
                }
                //trøbbel
            }
        }
    }

    public static List<Tuple<string, string, string>> DrillDownRedlistedNaturetypes(JsonArray array, string child = "Children", string parent = "")
    {
        var result = new List<Tuple<string, string, string>>();
        foreach (var node in array)
        {
            var value = node["Value"].GetValue<string>() + "|" + node["Id"].GetValue<string>();
            var text = node["Text"].GetValue<string>();
            var transferParent = (parent == "" ? text : parent);
            result.Add(new Tuple<string, string, string>(value, text, transferParent));
            result.AddRange(DrillDownRedlistedNaturetypes(node[child].AsArray(), child, transferParent));
        }

        return result;
    }

    public static List<Tuple<string, string, string>> DrillDownNaturetypes23(JsonArray array, string id = "Id", string cat = "Category",
        string child = "Children", string parentCategory = "")
    {
        var result = new List<Tuple<string, string,string>>();
        foreach (var node in array)
        {
            var idn = node[id].GetValue<string>();
            var category = node[cat].GetValue<string>();
            var tekst = node["Text"].GetValue<string>();
            if (parentCategory == "Hovedtype" && category == "Grunntype")
                result.Add(new Tuple<string, string,string>(idn, category, tekst));
            if (parentCategory == "Hovedtype" && category == "Kartleggingsenhet")
                result.Add(new Tuple<string, string,string>(idn, category, tekst));

            result.AddRange(DrillDownNaturetypes23(node[child].AsArray(), id, cat, child, category));
        }

        return result;
    }
    public static List<Tuple<string, string, string, string>> DrillDownNaturetypes23H(JsonArray array, string id = "Id", string cat = "Category",
        string child = "Children", string parentCategory = "", string parentText = "")
    {
        var result = new List<Tuple<string, string, string, string>>();
        foreach (var node in array)
        {
            var idn = node[id].GetValue<string>();
            var category = node[cat].GetValue<string>();
            var tekst = node["Text"].GetValue<string>();
            if (category == "Hovedtypegruppe")
                parentText = tekst;
            if (category == "Hovedtype")
                result.Add(new Tuple<string, string, string, string>(idn, category, tekst, parentText));
            if (parentCategory == "Hovedtype" && category == "Grunntype")
                result.Add(new Tuple<string, string, string, string>(idn, category, tekst, parentText));
            if (parentCategory == "Hovedtype" && category == "Kartleggingsenhet")
                result.Add(new Tuple<string, string, string, string>(idn, category, tekst, parentText));
            if (parentCategory == "Kartleggingsenhet" && category == "Grunntype")
                result.Add(new Tuple<string, string, string, string>(idn, category, tekst, parentText));

            result.AddRange(DrillDownNaturetypes23H(node[child].AsArray(), id, cat, child, category, parentText));
        }

        return result;
    }
    internal static List<Tuple<string, string, string>> DrillDownCodeList(JsonArray array, string parentCategory = "")
    {
        var result = new List<Tuple<string, string, string>>();
        foreach (var node in array)
        {
            var category = string.Empty;
            if (node["Value"] != null)
            {
                var code = node["Value"].GetValue<string>();
                category = node["Text"].GetValue<string>();

                result.Add(new Tuple<string, string, string>(code, category, parentCategory));
            }

            var jsonNode = node["Children"];
            if (jsonNode == null) continue;
            var jsonObject = jsonNode.AsObject().First();
            var jsonArray = jsonObject.Value.AsArray();
            result.AddRange(DrillDownCodeList(jsonArray, category));
        }

        return result;
    }

    internal static List<Tuple<string, string, string, string>> DrillDownCodeList2(JsonArray array, string text = "", string parentCategory = "")
    {
        var result = new List<Tuple<string, string, string, string>>();
        var toplevel = string.IsNullOrWhiteSpace(text);
        foreach (var node in array)
        {
            var category = string.Empty;
            var textValue = toplevel ? node["Text"].GetValue<string>() : text;
            //if (string.IsNullOrWhiteSpace(text))
            //{
            //    text = node["Text"].GetValue<string>();
            //}
            if (node["Value"] != null)
            {
                var code = node["Value"].GetValue<string>();
                category = node["Text"].GetValue<string>();

                result.Add(new Tuple<string, string, string, string>(code, category, parentCategory, textValue));
            }

            var jsonNode = node["Children"];
            if (jsonNode == null) continue;
            var jsonObject = jsonNode.AsObject().First();
            var jsonArray = jsonObject.Value.AsArray();
            result.AddRange(DrillDownCodeList2(jsonArray, textValue, category));
        }

        return result;
    }

    /// <summary>
    ///     Fix ReasonForChange based on 2018 assessments
    /// </summary>
    public static void FixReasonForChangeBasedOn2018(FA4 exAssessment, FA3Legacy oldAssessment)
    {
        if (exAssessment.EvaluationStatus == "finished" &&
            exAssessment.LastUpdatedAt <= ImportDataService._magicemaildatedateTime)
            if (oldAssessment.RiskAssessment.RedListUsedCriteria != null && (oldAssessment.RiskAssessment
                                                                                 .RedListUsedCriteria.Contains("B") ||
                                                                             oldAssessment.RiskAssessment
                                                                                 .RedListUsedCriteria.Contains("D2"))
                                                                         && !oldAssessment.RiskAssessment
                                                                             .RedListUsedCriteria.Contains("D1"))
                if (oldAssessment.RiskAssessment.ChosenSpreadMedanLifespan == "RedListCategoryLevel")
                    if (oldAssessment.AlienSpeciesCategory != "NotApplicable" &&
                        ImportDataService._importantCategories.Contains(oldAssessment.RiskAssessment.RiskLevelCode))
                        if (oldAssessment.RiskAssessment.RiskLevelCode != exAssessment.Category)
                        {
                            var oldValue = oldAssessment.RiskAssessment.Criteria.First(x => x.CriteriaLetter == "A")
                                .Value;
                            var newValue = exAssessment.RiskAssessment.Criteria.First(x => x.CriteriaLetter == "A")
                                .Value;
                            if ((oldAssessment.RiskAssessment.DecisiveCriteria.Contains("A")
                                 || oldAssessment.RiskAssessment.DecisiveCriteria == "1,1")
                                && oldValue < newValue)
                                if (exAssessment.ReasonForChangeOfCategory.Any(x => x == "changedCriteria"))
                                {
                                    exAssessment.ReasonForChangeOfCategory.Remove("changedCriteria");
                                    if (exAssessment.ReasonForChangeOfCategory.All(
                                            x => x != "changedCriteriaInterpretation"))
                                        exAssessment.ReasonForChangeOfCategory.Add(
                                            "changedCriteriaInterpretation");
                                }
                        }
    }

    /// <summary>
    /// Litt usikker på hva denne var for igjen...
    /// </summary>
    public static void TestForNaturetypeTrouble(IConsole console, FA4 exAssessment, string[] RedList,
        Dictionary<string, Tuple<string, string>> dictionary, Dictionary<string, Tuple<string, string>> dictNin)
    {
        if (exAssessment.ImpactedNatureTypes.Any())
        {
            foreach (var impactedNatureType in exAssessment.ImpactedNatureTypes)
            {
                var natureTypeArea = impactedNatureType.AffectedArea;


                if (RedList.Contains(impactedNatureType.NiNCode) && exAssessment.EvaluationStatus == "finished" &&
                    natureTypeArea != "0")
                    console.WriteLine(
                        $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {exAssessment.ExpertGroup} {impactedNatureType.NiNCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                //if (RedList.Contains(impactedNatureType.NiNCode)) // && exAssessment.EvaluationStatus == "finished") // && natureTypeArea != "0")
                //{
                //    if (exAssessment.ExpertGroup.ToLowerInvariant().Contains("svalbard"))
                //    {
                //        // svalbard
                //        var newCode = dictionary.Where(x => x.Key.Split("|").First() == impactedNatureType.NiNCode)
                //            .First().Key.Split("|").Last();
                //        if (newCode == "75")
                //        {
                //            newCode = "124";
                //        }
                //        console.WriteLine(
                //            $"{exAssessment.ExpertGroup} {impactedNatureType.NiNCode} -> {newCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                //        impactedNatureType.NiNCode = newCode;
                //    }
                //    else
                //    {
                //        // annet
                //        var newCode = dictionary.Where(x => x.Key.Split("|").First() == impactedNatureType.NiNCode)
                //            .First().Key.Split("|").Last();
                //        if (newCode == "124")
                //        {
                //            newCode = "75";
                //        }
                //        console.WriteLine(
                //            $"{exAssessment.ExpertGroup} {impactedNatureType.NiNCode} -> {newCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                //        impactedNatureType.NiNCode = newCode;
                //    }

                //    //console.WriteLine(
                //    //    $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:": string.Empty)} {exAssessment.ExpertGroup} {impactedNatureType.NiNCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                //}
            }

            var test = exAssessment.ImpactedNatureTypes.GroupBy(x => x.NiNCode)
                .Select(x => new { NiNCode = x.Key, ImpactedNatureTypes = x.ToArray() });
            foreach (var group in test)
            {
                if (dictNin.Any(x => "NA " + x.Key.Split("-").First() == group.NiNCode))
                {
                    //console.WriteLine(
                    //    $"{(exAssessment.EvaluationStatus == "imported" ? "Ikkje påbegynt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                }

                if (group.ImpactedNatureTypes.Length > 1)
                {
                    if (dictNin.Any(x => "NA " + x.Key.Split("-").First() == group.NiNCode))
                        console.WriteLine(
                            $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                    if (dictNin.Any(x => x.Key.Split("-").First() == group.NiNCode))
                    {
                        //console.WriteLine(
                        //    $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                    }

                    var test2 = group.ImpactedNatureTypes.Select(x => x.TimeHorizon).Distinct().ToArray();
                    if (test2.Length != group.ImpactedNatureTypes.Length && exAssessment.EvaluationStatus == "imported")
                    {
                        // hvis status = ''
                        //console.WriteLine(
                        //    $"{(exAssessment.EvaluationStatus == "imported" ? "Ikkje påbegynt:" : string.Empty)} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                        var naturtyper = group.ImpactedNatureTypes.ToArray();

                        var naturtyperLength = naturtyper.Length;
                        var removed = new List<FA4.ImpactedNatureType>();
                        for (var i = 0; i < naturtyperLength; i++)
                        {
                            var outer = naturtyper[i];
                            if (removed.Contains(outer)) continue;

                            for (var j = i + 1; j < naturtyperLength; j++)
                            {
                                var inner = naturtyper[j];
                                if (removed.Contains(inner)) continue;

                                if (outer.NiNCode == inner.NiNCode &&
                                    outer.TimeHorizon == inner.TimeHorizon &&
                                    outer.ColonizedArea == inner.ColonizedArea &&
                                    outer.AffectedArea == inner.AffectedArea &&
                                    outer.StateChange.All(x => inner.StateChange.Contains(x)) &&
                                    outer.Background.All(x => inner.Background.Contains(x))
                                   )
                                {
                                    removed.Add(inner);
                                    exAssessment.ImpactedNatureTypes.Remove(inner);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /// <summary>
    /// Litt usikker på hva denne var for igjen...
    /// </summary>
    public static void FixMainNaturetype(IConsole console, FA4 exAssessment, string[] RedList,
        Dictionary<string, Tuple<string, string>> redlistedNaturetypes, Dictionary<string, Tuple<string, string, string>> dictNin) {
        if (exAssessment.ImpactedNatureTypes.Any()) {
            foreach (var impactedNatureType in exAssessment.ImpactedNatureTypes) {
                var natureTypeArea = impactedNatureType.AffectedArea;


                if (redlistedNaturetypes.ContainsKey(impactedNatureType.NiNCode))
                {
                    var denne = redlistedNaturetypes[impactedNatureType.NiNCode];
                    impactedNatureType.MajorTypeGroup = denne.Item2;
                }
                else if (dictNin.ContainsKey(impactedNatureType.NiNCode)) {
                    var denne = dictNin[impactedNatureType.NiNCode];
                    impactedNatureType.MajorTypeGroup = denne.Item3;
                }
                else if (dictNin.ContainsKey(impactedNatureType.NiNCode.Replace("NA ",""))) {
                    var denne = dictNin[impactedNatureType.NiNCode.Replace("NA ", "")];
                    impactedNatureType.MajorTypeGroup = denne.Item3;
                }
                else
                {
                    console.WriteLine(
                     $"{exAssessment.ExpertGroup} {impactedNatureType.NiNCode} -> NOTFOUND {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                }
                //if (RedList.Contains(impactedNatureType.NiNCode)) // && exAssessment.EvaluationStatus == "finished") // && natureTypeArea != "0")
                //{
                //    if (exAssessment.ExpertGroup.ToLowerInvariant().Contains("svalbard"))
                //    {
                //        // svalbard
                //        var newCode = dictionary.Where(x => x.Key.Split("|").First() == impactedNatureType.NiNCode)
                //            .First().Key.Split("|").Last();
                //        if (newCode == "75")
                //        {
                //            newCode = "124";
                //        }
                //        console.WriteLine(
                //            $"{exAssessment.ExpertGroup} {impactedNatureType.NiNCode} -> {newCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                //        impactedNatureType.NiNCode = newCode;
                //    }
                //    else
                //    {
                //        // annet
                //        var newCode = dictionary.Where(x => x.Key.Split("|").First() == impactedNatureType.NiNCode)
                //            .First().Key.Split("|").Last();
                //        if (newCode == "124")
                //        {
                //            newCode = "75";
                //        }
                //        console.WriteLine(
                //            $"{exAssessment.ExpertGroup} {impactedNatureType.NiNCode} -> {newCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                //        impactedNatureType.NiNCode = newCode;
                //    }

                //    //console.WriteLine(
                //    //    $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:": string.Empty)} {exAssessment.ExpertGroup} {impactedNatureType.NiNCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                //}
            }

            //var test = exAssessment.ImpactedNatureTypes.GroupBy(x => x.NiNCode)
            //    .Select(x => new { NiNCode = x.Key, ImpactedNatureTypes = x.ToArray() });
            //foreach (var group in test) {
            //    if (dictNin.Any(x => "NA " + x.Key.Split("-").First() == group.NiNCode)) {
            //        //console.WriteLine(
            //        //    $"{(exAssessment.EvaluationStatus == "imported" ? "Ikkje påbegynt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
            //    }

            //    if (group.ImpactedNatureTypes.Length > 1) {
            //        if (dictNin.Any(x => "NA " + x.Key.Split("-").First() == group.NiNCode))
            //            console.WriteLine(
            //                $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
            //        if (dictNin.Any(x => x.Key.Split("-").First() == group.NiNCode)) {
            //            //console.WriteLine(
            //            //    $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
            //        }

            //        var test2 = group.ImpactedNatureTypes.Select(x => x.TimeHorizon).Distinct().ToArray();
            //        if (test2.Length != group.ImpactedNatureTypes.Length && exAssessment.EvaluationStatus == "imported") {
            //            // hvis status = ''
            //            //console.WriteLine(
            //            //    $"{(exAssessment.EvaluationStatus == "imported" ? "Ikkje påbegynt:" : string.Empty)} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
            //            var naturtyper = group.ImpactedNatureTypes.ToArray();

            //            var naturtyperLength = naturtyper.Length;
            //            var removed = new List<FA4.ImpactedNatureType>();
            //            for (var i = 0; i < naturtyperLength; i++) {
            //                var outer = naturtyper[i];
            //                if (removed.Contains(outer)) continue;

            //                for (var j = i + 1; j < naturtyperLength; j++) {
            //                    var inner = naturtyper[j];
            //                    if (removed.Contains(inner)) continue;

            //                    if (outer.NiNCode == inner.NiNCode &&
            //                        outer.TimeHorizon == inner.TimeHorizon &&
            //                        outer.ColonizedArea == inner.ColonizedArea &&
            //                        outer.AffectedArea == inner.AffectedArea &&
            //                        outer.StateChange.All(x => inner.StateChange.Contains(x)) &&
            //                        outer.Background.All(x => inner.Background.Contains(x))
            //                       ) {
            //                        removed.Add(inner);
            //                        exAssessment.ImpactedNatureTypes.Remove(inner);
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}
        }
    }


    public static Dictionary<int, Rodliste2021Rad[]> GetRedlistByScientificNameDictionary(string inputFolder,
        CsvConfiguration theCsvConfiguration)
    {
        Dictionary<int, Rodliste2021Rad[]> redlistByScientificName;
        using (var reader = new StreamReader(inputFolder + "\\..\\Importfiler\\rødliste-2021.csv"))
        {
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<Rodliste2021Rad>();
                redlistByScientificName = records.GroupBy(x => x.VitenskapeligId)
                    .ToDictionary(x => x.Key, y => y.OrderBy(x => x.Region).ToArray());
            }
        }

        return redlistByScientificName;
    }

    public static TransferDataRad[] GetTransferDataList(string inputFolder,
        CsvConfiguration theCsvConfiguration)
    {
        TransferDataRad[] dataRad;
        using (var reader = new StreamReader(inputFolder + "\\..\\Importfiler\\transferdata.csv"))
        {
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<TransferDataRad>();
                dataRad = records.ToArray();
            }
        }

        return dataRad;
    }

    private static Rodliste2021Rad GetRegionalRedlist(Dictionary<int, Rodliste2021Rad[]> redlistByScientificName,
        int currentSciId, string exAssessmentExpertGroup)
    {
        if (!redlistByScientificName.ContainsKey(currentSciId)) return null;
        var hits = redlistByScientificName[currentSciId];
        var svalbard = exAssessmentExpertGroup.ToLowerInvariant().Contains("svalbard");
        if (hits.Length == 0) return null;
        if (!svalbard && hits.Length == 1 && hits[0].Region == "Svalbard") return null;
        if (hits.Length == 1) return hits[0];
        var svalbardvurdering = hits.SingleOrDefault(x => x.Region == "Svalbard");
        var fastlandsvurdering = hits.SingleOrDefault(x => x.Region != "Svalbard");
        if (svalbard && svalbardvurdering != null) return svalbardvurdering;
        if (svalbard && svalbardvurdering == null) return fastlandsvurdering;
        if (!svalbard && fastlandsvurdering != null) return fastlandsvurdering;
        return fastlandsvurdering;
    }

    /// <summary>
    /// Import and fix bioclimateZones from file - was changed after initial import as first file had errors and went live
    /// </summary>
    public static void FixZones(Dictionary<int, BioClimData> bioClimDatas, Dictionary<int, BioClimData> previousImport,
        FA4 fa4, Assessment assessment)
    {
        bool ZonesHasValue(List<FA4.BioClimateZones> bioClimateZones, string sonen)
        {
            var zone = bioClimateZones.First(x => x.ClimateZone == sonen);
            return zone.ClearOceanic || zone.StrongOceanic || zone.TransferSection || zone.WeakOceanic ||
                   zone.WeakContinental;
        }

        void SetZones(List<FA4.BioClimateZones> bioClimateZones, string boreonemoral, bool clearOceanic,
            bool strongOceanic, bool transferSection1,
            bool weakOceanic1, bool? weakContinental)
        {
            var zone = bioClimateZones.First(x => x.ClimateZone == boreonemoral);
            zone.ClearOceanic = clearOceanic;
            zone.StrongOceanic = strongOceanic;
            zone.TransferSection = transferSection1;
            zone.WeakOceanic = weakOceanic1;
            if (weakContinental.HasValue) zone.WeakContinental = weakContinental.Value;
        }

        bool MatchesZones(List<FA4.BioClimateZones> bioClimateZones, string boreonemoral, bool clearOceanic,
            bool strongOceanic, bool transferSection1,
            bool weakOceanic1, bool? weakContinental)
        {
            var zone = bioClimateZones.First(x => x.ClimateZone == boreonemoral);
            var isMatch = zone.ClearOceanic == clearOceanic && zone.StrongOceanic == strongOceanic &&
                          zone.TransferSection == transferSection1 && zone.WeakOceanic == weakOceanic1;
            if (isMatch && weakContinental.HasValue) isMatch = zone.WeakContinental == weakContinental.Value;
            return isMatch;
        }

        {
            if (bioClimDatas.ContainsKey(assessment.Id))
                if (previousImport.ContainsKey(assessment.Id))
                {
                    var data = previousImport[assessment.Id];
                    if (
                            MatchesZones(fa4.CurrentBioClimateZones, "boreonemoral",
                                data.boreonemoral_clearOceanic,
                                data.boreonemoral_strongOceanic, data.boreonemoral_transferSection,
                                data.boreonemoral_weakOceanic, null)
                            && MatchesZones(fa4.CurrentBioClimateZones, "southBoreal",
                                data.southBoreal_clearOceanic,
                                data.southBoreal_strongOceanic, data.southBoreal_transferSection,
                                data.southBoreal_weakOceanic, null)
                            && MatchesZones(fa4.CurrentBioClimateZones, "midBoreal",
                                data.midBoreal_clearOceanic,
                                data.midBoreal_strongOceanic, data.midBoreal_transferSection,
                                data.midBoreal_weakOceanic,
                                data.midBoreal_weakContinental)
                            && MatchesZones(fa4.CurrentBioClimateZones, "northBoreal",
                                data.northBoreal_clearOceanic,
                                data.northBoreal_strongOceanic, data.northBoreal_transferSection,
                                data.northBoreal_weakOceanic, data.northBoreal_weakContinental)
                            && MatchesZones(fa4.CurrentBioClimateZones, "alpineZones",
                                data.alpineZones_clearOceanic,
                                data.alpineZones_strongOceanic, data.alpineZones_transferSection,
                                data.alpineZones_weakOceanic, data.alpineZones_weakContinental)
                        )
                        // stemmer med forrige oppdatering
                        if (!
                            ((assessment.LastUpdatedByUserId == Guid.Parse("AB2D2A9C-4E5B-4983-A2A7-14F8670CF6E7") ||
                              assessment.LastUpdatedByUserId == Guid.Parse("155B4F00-03DB-4EF7-8098-B823ADA890DA"))
                             && fa4.EvaluationStatus == "finished"))
                        {
                            var bioClimData = bioClimDatas[assessment.Id];

                            fa4.Id = assessment.Id;
                            SetZones(fa4.CurrentBioClimateZones, "boreonemoral",
                                bioClimData.boreonemoral_clearOceanic,
                                bioClimData.boreonemoral_strongOceanic,
                                bioClimData.boreonemoral_transferSection,
                                bioClimData.boreonemoral_weakOceanic, null);
                            SetZones(fa4.CurrentBioClimateZones, "southBoreal",
                                bioClimData.southBoreal_clearOceanic,
                                bioClimData.southBoreal_strongOceanic, bioClimData.southBoreal_transferSection,
                                bioClimData.southBoreal_weakOceanic, null);
                            SetZones(fa4.CurrentBioClimateZones, "midBoreal",
                                bioClimData.midBoreal_clearOceanic,
                                bioClimData.midBoreal_strongOceanic, bioClimData.midBoreal_transferSection,
                                bioClimData.midBoreal_weakOceanic,
                                bioClimData.midBoreal_weakContinental);
                            SetZones(fa4.CurrentBioClimateZones, "northBoreal",
                                bioClimData.northBoreal_clearOceanic,
                                bioClimData.northBoreal_strongOceanic, bioClimData.northBoreal_transferSection,
                                bioClimData.northBoreal_weakOceanic, bioClimData.northBoreal_weakContinental);
                            SetZones(fa4.CurrentBioClimateZones, "alpineZones",
                                bioClimData.alpineZones_clearOceanic,
                                bioClimData.alpineZones_strongOceanic, bioClimData.alpineZones_transferSection,
                                bioClimData.alpineZones_weakOceanic, bioClimData.alpineZones_weakContinental);
                        }
                }
        }
    }

    /// <summary>
    /// Import and fix bioclimateZones from file - was changed after initial import as first file had errors and went live, third time krøll from olav
    /// </summary>
    public static void FixZonesOlavsArter(Dictionary<int, BioClimData> bioClimDatas, FA4 fa4, Assessment assessment)
    {
        bool ZonesHasValue(List<FA4.BioClimateZones> bioClimateZones, string sonen)
        {
            var zone = bioClimateZones.First(x => x.ClimateZone == sonen);
            return zone.ClearOceanic || zone.StrongOceanic || zone.TransferSection || zone.WeakOceanic ||
                   zone.WeakContinental;
        }

        void SetZones(List<FA4.BioClimateZones> bioClimateZones, string boreonemoral, bool clearOceanic,
            bool strongOceanic, bool transferSection1,
            bool weakOceanic1, bool? weakContinental)
        {
            var zone = bioClimateZones.First(x => x.ClimateZone == boreonemoral);
            zone.ClearOceanic = clearOceanic;
            zone.StrongOceanic = strongOceanic;
            zone.TransferSection = transferSection1;
            zone.WeakOceanic = weakOceanic1;
            if (weakContinental.HasValue) zone.WeakContinental = weakContinental.Value;
        }

        bool MatchesZones(List<FA4.BioClimateZones> bioClimateZones, string boreonemoral, bool clearOceanic,
            bool strongOceanic, bool transferSection1,
            bool weakOceanic1, bool? weakContinental)
        {
            var zone = bioClimateZones.First(x => x.ClimateZone == boreonemoral);
            var isMatch = zone.ClearOceanic == clearOceanic && zone.StrongOceanic == strongOceanic &&
                          zone.TransferSection == transferSection1 && zone.WeakOceanic == weakOceanic1;
            if (isMatch && weakContinental.HasValue) isMatch = zone.WeakContinental == weakContinental.Value;
            return isMatch;
        }

        if (bioClimDatas.ContainsKey(assessment.Id))
            //var data = bioClimDatas[realId];
            if ((assessment.LastUpdatedByUserId == Guid.Parse("A0083D39-683B-4475-B7D9-9F3996F2CA6C")) &&
                // men bare hvis alt er false
                !(ZonesHasValue(fa4.CurrentBioClimateZones, "boreonemoral")
                  || ZonesHasValue(fa4.CurrentBioClimateZones, "southBoreal")
                  || ZonesHasValue(fa4.CurrentBioClimateZones, "midBoreal")
                  || ZonesHasValue(fa4.CurrentBioClimateZones, "northBoreal")
                  || ZonesHasValue(fa4.CurrentBioClimateZones, "alpineZones")))
            {
                var bioClimData = bioClimDatas[assessment.Id];

                fa4.Id = assessment.Id;
                SetZones(fa4.CurrentBioClimateZones, "boreonemoral",
                    bioClimData.boreonemoral_clearOceanic,
                    bioClimData.boreonemoral_strongOceanic,
                    bioClimData.boreonemoral_transferSection,
                    bioClimData.boreonemoral_weakOceanic, null);
                SetZones(fa4.CurrentBioClimateZones, "southBoreal",
                    bioClimData.southBoreal_clearOceanic,
                    bioClimData.southBoreal_strongOceanic, bioClimData.southBoreal_transferSection,
                    bioClimData.southBoreal_weakOceanic, null);
                SetZones(fa4.CurrentBioClimateZones, "midBoreal",
                    bioClimData.midBoreal_clearOceanic,
                    bioClimData.midBoreal_strongOceanic, bioClimData.midBoreal_transferSection,
                    bioClimData.midBoreal_weakOceanic,
                    bioClimData.midBoreal_weakContinental);
                SetZones(fa4.CurrentBioClimateZones, "northBoreal",
                    bioClimData.northBoreal_clearOceanic,
                    bioClimData.northBoreal_strongOceanic, bioClimData.northBoreal_transferSection,
                    bioClimData.northBoreal_weakOceanic, bioClimData.northBoreal_weakContinental);
                SetZones(fa4.CurrentBioClimateZones, "alpineZones",
                    bioClimData.alpineZones_clearOceanic,
                    bioClimData.alpineZones_strongOceanic, bioClimData.alpineZones_transferSection,
                    bioClimData.alpineZones_weakOceanic, bioClimData.alpineZones_weakContinental);
            }
    }

    public static Dictionary<int, BioClimData> GetBioClimDataFromFile(CsvConfiguration theCsvConfiguration,
        string inputFolder, string file)
    {
        var result = new Dictionary<int, BioClimData>();
        using (var reader = new StreamReader(inputFolder + "\\..\\Importfiler\\" + file))
        {
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<BioClimData>();
                result = records.ToDictionary(x => x.Id, y => y);
            }
        }

        return result;
    }

    public static Dictionary<int, MisIdentifiedData> GetMisIdentifiedDataFromFile(CsvConfiguration theCsvConfiguration,
        string inputFolder, string file)
    {
        var result = new Dictionary<int, MisIdentifiedData>();
        using (var reader = new StreamReader(inputFolder + "\\..\\Importfiler\\" + file))
        {
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<MisIdentifiedData>();
                result = records.ToDictionary(x => x.AssessmentId, y => y);
            }
        }

        return result;
    }
    public static Dictionary<string, Fa2Data> Get2012DataFromFile(CsvConfiguration theCsvConfiguration,
        string inputFolder, string file)
    {
        var result = new Dictionary<string, Fa2Data>();
        using (var reader = new StreamReader(inputFolder + "\\..\\Importfiler\\" + file))
        {
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<Fa2Data>();
                result = records.ToDictionary(x =>x.EvaluationContext + ":" + x.KongId, y => y);
            }
        }

        return result;
    }

    public static void FixSpeciesNatureTypeInteractionsWithLI(FA4 exAssessment, int realId)
    {
        if (!ImportDataService._disse.Contains(realId)) return;

        var sjekk = exAssessment.RiskAssessment.SpeciesNaturetypeInteractions.ToArray();
        foreach (var speciesNaturetypeInteraction in sjekk)
            if (speciesNaturetypeInteraction.NiNCode.StartsWith("LI"))
                exAssessment.RiskAssessment.SpeciesNaturetypeInteractions.Remove(speciesNaturetypeInteraction);
    }

    public static void Fix2012Assessment(FA4 exAssessment, Dictionary<string, Fa2Data> assessmaents2012Connection)
    {
        if (exAssessment.PreviousAssessments.Any(x=>x.RevisionYear == 2012))
        {
            var previousAssessment = exAssessment.PreviousAssessments.Single(x => x.RevisionYear == 2012);
            var key = (exAssessment.EvaluationContext == "Svalbard" || exAssessment.EvaluationContext == "S" ? "S" : "N") + ":" + previousAssessment.AssessmentId;
            if (assessmaents2012Connection.ContainsKey(key))
            {
                var oldie = assessmaents2012Connection[key];
                if (!previousAssessment.AssessmentId.Contains(":"))
                {
                    previousAssessment.AssessmentId = previousAssessment.AssessmentId + ":" + oldie.EvaluationContext + oldie.TaxonId;
                }

                previousAssessment.EcologicalRiskLevel =oldie.EcologicalEffectRiskLevel ?? 0;
                previousAssessment.SpreadRiskLevel = oldie.SpreadRiskLevel ?? 0;
                previousAssessment.RiskLevel = oldie.RiskLevel ?? 0;
                var a = (oldie.SpreadRiskLevel.HasValue
                    ? oldie.SpreadRiskLevel.Value + oldie.SpreadRiskDecisiveCriterias.ToUpperInvariant().Replace(",","") : string.Empty);
                var b = (oldie.EcologicalEffectRiskLevel.HasValue
                        ? oldie.EcologicalEffectRiskLevel.Value + oldie.EcologicalEffectDecisiveCriterias.ToUpperInvariant().Replace(",", "") : string.Empty);
                if (!string.IsNullOrWhiteSpace(a) && !string.IsNullOrWhiteSpace(b))
                {
                    previousAssessment.DecisiveCriteria = a + "," + b;
                }

                previousAssessment.MainCategory = oldie.AlienSpeciesCategory;
                previousAssessment.MainSubCategory = oldie.IsEvaluated ? "RiskAssessed" : "noRiskAssessment";
            }
            else
            {
                if (previousAssessment.AssessmentId != "0" && exAssessment.ExpertGroup != "Testedyr")
                {
                    
                }
            }
        }
    }

    public static void FixMainCategoryWhenMissing(FA4 assessment, List<Tuple<string, string, string, string>> migrationPathway)
    {
        bool Tryfind(Tuple<string, string, string, string>[] filtrert, MigrationPathway vector, string codeItem)
        {
            var found = false;
            var thisOne = filtrert.Where(x => x.Item1 == codeItem).ToArray();
            if (thisOne.Length == 1)
            {
                vector.Category = thisOne[0].Item2;
                vector.MainCategory = thisOne[0].Item3;
                found = true;
            }
            else
            {
                Console.WriteLine(
                    $"Hits: {thisOne.Length} : {codeItem} - introductionSpread: {vector.IntroductionSpread} Assessment: {assessment.EvaluatedScientificName} {assessment.ExpertGroup}");
            }
            return found;
        }

        if (assessment.ImportPathways.Any())
        {
            foreach (var importPathway in assessment.ImportPathways)
            {
                if (string.IsNullOrWhiteSpace(importPathway.Category) || string.IsNullOrWhiteSpace(importPathway.MainCategory))
                {
                    if (importPathway.CodeItem == "" || importPathway.CodeItem == "importContaminantNurseryMaterial" || importPathway.CodeItem == "contaminantOnPlantsCommercial")
                    {
                        importPathway.CodeItem = "importContaminantOnPlantsCommercial";
                    }
                    var filtrert = migrationPathway.Where(x => x.Item4 == "Import").ToArray();
                    var thisOne = filtrert.Where(x => x.Item1 == importPathway.CodeItem).ToArray();
                    if (thisOne.Length == 1)
                    {
                        importPathway.Category = thisOne[0].Item2;
                        importPathway.MainCategory = thisOne[0].Item3;

                    }
                    else
                    {
                        Console.WriteLine($"Hits: {thisOne.Length} : {importPathway.CodeItem} Assessment: {assessment.EvaluatedScientificName} {assessment.ExpertGroup}");
                    }
                }
            }
        }

        if (assessment.AssesmentVectors.Any())
        {
            var assessmentAssesmentVectors = assessment.AssesmentVectors.ToArray();
            foreach (var vector in assessmentAssesmentVectors)
            {
                if (string.IsNullOrWhiteSpace(vector.Category) ||
                    string.IsNullOrWhiteSpace(vector.MainCategory))
                {

                    switch (vector.CodeItem)
                    {
                        case "importContaminantNurseryMaterial":
                            vector.CodeItem = "contaminantOnPlantsCommercial";
                            break;
                        case "otherUnknownContaminant":
                            vector.CodeItem = "other/unknown contaminant";
                            break;
                        case "otherUnknownEscape":
                            if (assessment.EvaluatedScientificName == "Cryptomeria japonica")
                            {
                                vector.CodeItem = "otherEscape";
                            }
                            break;
                        case "contaminantNurseryMaterial":
                            vector.CodeItem = "contaminantOnPlantsCommercial";
                            break;                        
                        case "ContaminantOnPlantsCommercial":
                            vector.CodeItem = "contaminantOnPlantsCommercial";
                            break;
                    }

                    switch (vector.IntroductionSpread)
                    {
                        case "introduction":
                            var filtrert = migrationPathway.Where(x => x.Item4 == "Innførsel" || x.Item4 == "Spredning")
                                .ToArray();
                            var found =  Tryfind(filtrert, vector, vector.CodeItem);
                            if (found == false && vector.CodeItem.StartsWith("import"))
                            {
                                var codeItem = FirstCharToLowerCase(vector.CodeItem.Substring(6));
                                found = Tryfind(filtrert, vector, codeItem);
                                if (found) vector.CodeItem = codeItem;
                            }
                            break;
                        case "spread":
                            var filtrert2 = migrationPathway.Where(x => x.Item4 == "Videre spredning" || x.Item4 == "Spredning").ToArray();
                            var found2 = Tryfind(filtrert2, vector, vector.CodeItem);
                            if (found2 == false && vector.CodeItem.StartsWith("import"))
                            {
                                var codeItem = FirstCharToLowerCase(vector.CodeItem.Substring(6));
                                found2 = Tryfind(filtrert2, vector, codeItem);
                                if (found2) vector.CodeItem = codeItem;
                            }

                            break;
                        default:
                            Console.WriteLine($"Type : {vector.IntroductionSpread}");
                            break;
                    }

                    if (string.IsNullOrWhiteSpace(vector.Category) ||
                        string.IsNullOrWhiteSpace(vector.MainCategory))
                    {
                        switch (vector.CodeItem)
                        {
                            case "aquaculture":
                            case "horticulture":
                            case "forestry":
                            case "liveAnimalFoodBait":
                            case "otherIntentionalRelease":
                            case "botanicalGardenZooAquarium":
                            case "otherEscape":
                            case "research":
                            //case "":
                                assessment.AssesmentVectors.Remove(vector);
                                break;
                        }
                    }
                }
            }
        }
    }
    public static string? FirstCharToLowerCase(this string? str)
    {
        if (!string.IsNullOrEmpty(str) && char.IsUpper(str[0]))
            return str.Length == 1 ? char.ToLower(str[0]).ToString() : char.ToLower(str[0]) + str[1..];

        return str;
    }

    public static void FixMissingNaturtypeName(FA4 exAssessment, Dictionary<string, Tuple<string, string, string>> dictNin23,
        Dictionary<string, Tuple<string, string>> dict)
    {
        // key = "NA T12|124" altså med kode og value 
        // var dict
        foreach (var interaction in exAssessment.RiskAssessment.SpeciesNaturetypeInteractions)
        {
            if  (string.IsNullOrWhiteSpace(interaction.Name))
            {
                var hit = exAssessment.ImpactedNatureTypes
                    .FirstOrDefault(x => x.NiNCode == interaction.NiNCode);
                var hit2 = exAssessment.ImpactedNatureTypes
                    .FirstOrDefault(x => x.NiNCode == "NA " + interaction.NiNCode);
                if (hit != null)
                {
                    interaction.Name = hit.Name;
                }
                else if (hit2 != null)
                {
                    interaction.Name = hit2.Name;
                }
                else
                {
                    var redhit = dict.FirstOrDefault(x => x.Key.Split("|")[0] == interaction.NiNCode);
                    var hit3 = dictNin23
                        .FirstOrDefault(x => x.Key == interaction.NiNCode);
                    var hit4 = dictNin23
                        .FirstOrDefault(x => x.Key == "NA " + interaction.NiNCode);
                    if (!string.IsNullOrWhiteSpace(redhit.Key))
                    {
                        interaction.Name = redhit.Value.Item1;
                    }
                    else if (!string.IsNullOrWhiteSpace(hit3.Key))
                    {
                        interaction.Name = hit3.Value.Item2;
                    }
                    else if (!string.IsNullOrWhiteSpace(hit4.Key))
                    {
                        interaction.Name = hit4.Value.Item2;
                    }
                    else
                    {
                        Console.WriteLine($"Ikke Treff på: {interaction.NiNCode} For { exAssessment.ExpertGroup} { exAssessment.EvaluatedScientificName}");
                    }

                    //var hit3 = dictNin23
                    //    .FirstOrDefault(x => x.Key == interaction.NiNCode);
                    //var hit4 = dictNin23
                    //    .FirstOrDefault(x => x.Key == "NA " + interaction.NiNCode);
                }
            }
        }
    }

    public static List<(int AssessmentId, bool AllSubTaxaAssessedSeparately, bool IsHybridWithoutOwnRiskAssessment, string AlienSpeciesCategory, string AllSubTaxaAssessedSeparatelyDescription, string IsHybridWithoutOwnRiskAssessmentDescription, string AssessmentConclusion, string Category, string EvaluationStatus)> CrazySpeciesList()
    {
        return new List<(
            int AssessmentId,
            bool AllSubTaxaAssessedSeparately,
            bool IsHybridWithoutOwnRiskAssessment,
            string AlienSpeciesCategory,
            string AllSubTaxaAssessedSeparatelyDescription,
            string IsHybridWithoutOwnRiskAssessmentDescription,
            string AssessmentConclusion,
            string Category,
            string EvaluationStatus)>()
        {
            (
                1413,
                true,
                false,
                "AllSubTaxaAssessedSeparately",
                "Det gis ingen fellesvurdering for arten; subsp.cruentus, subsp.hypochondriacus og subsp.quitensis ble alle sjaltet ut i horisontskanningen høsten 2021.Subsp.cruentus ble i FAB2018 vurdert på artsnivå som A.cruentus(som NR).Subsp.hypochondriacus ble i FAB2018 vurdert som egen underart(som NR) under arten A.hypochondriacus hvor også subsp.powellii hørte til den gangen.Se Elven mfl. 2022 for oppdatert taksonomi. Det som nå gjenstår i dette artskomplekset er A.hybridus subsp.powellii(tidligere A.hypochondriacus subsp.powellii), og denne risikovurderes separat.",
                "",
                "WillNotBeRiskAssessed",
                "NR",
                "finished"
            ),
            (1913,
                false,
                true,
                "HybridWithoutOwnRiskAssessment",
                "",
                "Hagtornen Crataegus x macrocarpa er en hybrid eller hybridart mellom den fremmede arten parkhagtorn C.laevigata og den hjemlige arten begerhagtorn C.rhipidophylla.Den er fertil og krysser seg trolig tilbake med foreldrene, og den oppstår spontant og er ikke en hageplante(se Elven mfl. 2022).Vi behandler den som et hybridiseringsproblem under C.laevigata og ikke som en separat art.",
                "WillNotBeRiskAssessed",
                "NR",
                "finished"
            ),
            (
                1914,
                false,
                true,
                "HybridWithoutOwnRiskAssessment",
                "",
                "Hagtornen Crataegus x media er en hybrid eller hybridart mellom den fremmede arten parkhagtorn C.laevigata og den hjemlige arten hagtorn C.monogyna.Den er fertil og krysser seg trolig tilbake med foreldrene, og den oppstår spontant og er ikke en hageplante(se Elven mfl. 2022).Vi behandler den som et hybridiseringsproblem under C.laevigata og ikke som en separat art.",
                "WillNotBeRiskAssessed",
                "NR",
                "finished")
        };    }

    public static void FixCrazySpecies(FA4 fa4, List<(int AssessmentId, bool AllSubTaxaAssessedSeparately, bool IsHybridWithoutOwnRiskAssessment, string AlienSpeciesCategory, string AllSubTaxaAssessedSeparatelyDescription, string IsHybridWithoutOwnRiskAssessmentDescription, string AssessmentConclusion, string Category, string EvaluationStatus)> crazySpecies)
    {
        var thisone = crazySpecies.SingleOrDefault(x=>x.AssessmentId == fa4.Id);

        if (thisone.AssessmentId == 0) return;

        fa4.AllSubTaxaAssessedSeparately = thisone.AllSubTaxaAssessedSeparately;
        fa4.AllSubTaxaAssessedSeparatelyDescription = thisone.AllSubTaxaAssessedSeparatelyDescription;
        fa4.IsHybridWithoutOwnRiskAssessment = thisone.IsHybridWithoutOwnRiskAssessment;
        fa4.IsHybridWithoutOwnRiskAssessmentDescription = thisone.IsHybridWithoutOwnRiskAssessmentDescription;
        fa4.AlienSpeciesCategory = thisone.AlienSpeciesCategory;
        //fa4.AssessmentConclusion
        //fa4.Category
        //fa4.EvaluationStatus
    }
}