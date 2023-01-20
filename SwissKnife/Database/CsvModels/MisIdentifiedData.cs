namespace SwissKnife.Database.CsvModels;

internal class MisIdentifiedData
{
    public int AssessmentId { get; set; }
    public bool MisIdentified { get; set; }
    public string AlienSpeciesCategory { get; set; }
    public string MisIdentifiedDescription { get; set; }
    public string AssessmentConclusion { get; set; }
    public string Category { get; set; }
    public string EvaluationStatus { get; set; }
}