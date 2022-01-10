using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Prod.Domain;
using Prod.Domain.Legacy;

namespace Prod.Api.Helpers
{
    public class ExportMapper
    {
        public static Mapper InitializeMapper()
        {
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<FA4WithComments, FA4HorizonScanExport>()
                    .ForMember(x => x.DoorKnockerType, opt => opt.MapFrom(src => GetDoorknockerType(src)))
                    ;
                cfg.CreateMap<FA4WithComments, FA4Export>()
                    .ForMember(x => x.DoorKnockerType, opt => opt.MapFrom(src => GetDoorknockerType(src)))
                    ;
            });
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }
        private static string GetDoorknockerType(FA4WithComments args)
        {
            var ass = args;
            var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
            if (ass2018 == null) return "New potential doorknocker";

            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "canNotEstablishWithin50years")
                return "Not established within 50 years";
            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "traditionalProductionSpecie")
                return "Traditional production species";
            if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")
                return "Not assessed doorknocker";
            return "Other NR 2018";
        }
    }


    public class FA4HorizonScanExport
    {
        public int Id { get; set; }
        public string ExpertGroup { get; set; }
        public string DoorKnockerType { get; set; }
        
        public string EvaluatedScientificNameId { get; set; }

        
        public string EvaluatedScientificName { get; set; }

        public string EvaluatedVernacularName { get; set; }
        public string EvaluatedScientificNameAuthor { get; set; }

        public string HorizonEstablismentPotential { get; set; }
        public string HorizonEstablismentPotentialDescription { get; set; }
        public string HorizonEcologicalEffect { get; set; }
        public string HorizonEcologicalEffectDescription { get; set; }
        public string LastUpdatedBy { get; set; }

    }
    public class FA4Export
    {
        public int Id { get; set; }
        public string ExpertGroup { get; set; }
        public string DoorKnockerType { get; set; }

        public string EvaluatedScientificNameId { get; set; }


        public string EvaluatedScientificName { get; set; }

        public string EvaluatedVernacularName { get; set; }
        public string EvaluatedScientificNameAuthor { get; set; }

        public string HorizonEstablismentPotential { get; set; }
        public string HorizonEstablismentPotentialDescription { get; set; }
        public string HorizonEcologicalEffect { get; set; }
        public string HorizonEcologicalEffectDescription { get; set; }
        public string LastUpdatedBy { get; set; }

    }
}
