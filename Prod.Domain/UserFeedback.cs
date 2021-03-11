using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Prod.Domain
{
    public enum UserFeedbackStatus
    {
        PostedWaitingConformation,
        ConfirmedByUser,
        RejectedByUser
    }

    public class UserFeedback
    {
        public int Id { get; set; } // ravenid
        public string InputFullName { get; set; }
        public string inputEmail { get; set; }
        public string inputComment { get; set; }
        public DateTime inputDate { get; set; }
        public int TaxonId { get; set; }
        public string ContextId { get; set; }
        public string LatinskNavn { get; set; }
        public string Ekspertgruppe { get; set; }
        public UserFeedbackStatus FeedbackStatus { get; set; }
        public string inputChapta { get; set; } 
        public string encodedChapta { get; set; }
        public string AcceptToken { get; set; }
        //public string RejectToken { get; set; }
    }

    public class UserFeedbackLog
    {
        public int Id { get; set; }
        public int TaxonId { get; set; }
        public string VurderingsContext { get; set; }
        public string LatNavn { get; set; }
        public DateTime EventTime { get; set; }
        public string EventType { get; set; }
    }
}
