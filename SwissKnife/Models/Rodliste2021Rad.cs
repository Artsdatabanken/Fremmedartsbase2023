namespace SwissKnife.Models;

internal class Rodliste2021Rad
{
    public int Id { get; set; }
    public string Region { get; set; }
    public string Ekspertkomite { get; set; }
    public string Artsgruppe { get; set; }
    public string Sti { get; set; }
    public int VitenskapeligId { get; set; }
    public string VitenskapeligNavn { get; set; }
    public string Autor { get; set; }
    public string Popnavn { get; set; }
    public string Rang { get; set; }
    public int År { get; set; }
    public string Kategori { get; set; }
}

internal class TransferDataRad
{
    public int FromId { get; set; }
    public string FromScientificName { get; set; }
    public int ToId { get; set; }
    public string ToScientificName { get; set; }
    public bool TransferSpeciesStatus { get; set; }
    public bool TransferSpeciesCharacteristics { get; set; }
    public bool TransferPathways { get; set; }
    public bool ReadyToTransfer { get; set; }
}