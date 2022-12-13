namespace SwissKnife.Database.CsvModels;

internal class Fa2Data
{
    public string EvaluationContext { get; set; }
    public int TaxonId { get; set; }
    public string ExpertGroup { get; set; }
    public string SpeciesGroup { get; set; }
    public string EvaluationCategory { get; set; }
    public int? RiskLevel { get; set; }
    public int? SpreadRiskLevel { get; set; }
    public int? EcologicalEffectRiskLevel { get; set; }
    public string SpreadRiskDecisiveCriterias { get; set; }
    public string EcologicalEffectDecisiveCriterias { get; set; }
    public int EvaluatedScientificNameId { get; set; }
    public int KongId { get; set; }


    public string EvaluatedScientificName { get; set; }
    public string AlienSpeciesCategory { get; set; }
    public bool IsEvaluated { get; set; }
}