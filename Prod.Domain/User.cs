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
            UserRoleInExpertGroups = new List<UserRoleInExpertGroup>();
        }

        public Guid Id { get; set; }
        public bool IsAdmin { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Application { get; set; }
        public bool HasAccess { get; set; }
        public bool HasAppliedForAccess { get; set; }

        public bool AccessDenied { get; set; }
        public DateTime DateGivenAccess { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateLastActive { get; set; }

        public List<UserRoleInExpertGroup> UserRoleInExpertGroups { get; set; }

        public class UserRoleInExpertGroup
        {
            public string ExpertGroupName { get; set; }

            [JsonIgnore]
            public User User { get; set; }
            public Guid UserId { get; set; }
            public bool Admin { get; set; }

            public bool WriteAccess { get; set; }

            //public bool Leser { get; set; }

            public DateTime DateCreated { get; set; }
            public Guid RoleGivenByUserId { get; set; }

        }


    }

}
