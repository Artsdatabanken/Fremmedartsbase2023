using System;

namespace Prod.Domain
{
    public class Files
    {
        public string Filename { get; set; }
        public int Size { get; set; }
        public string LastModified { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
    }
}