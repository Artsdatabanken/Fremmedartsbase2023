using System;
using System.Collections.Generic;
using System.Text;

namespace Prod.Domain
{
    public class AttachmentView
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string User { get; set; }
        public string UserId { get; set; }
        public string Date { get; set; }
        public string Name { get; set; }
        public string FileName { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class Attachment
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public Assessment Assessment { get; set; }
        public Bruker User { get; set; }
        public string UserId { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; }
        public string FileName { get; set; }
        public bool IsDeleted { get; set; }
        public byte[] File { get; set; }
        public string Type { get; set; }
    }
}
