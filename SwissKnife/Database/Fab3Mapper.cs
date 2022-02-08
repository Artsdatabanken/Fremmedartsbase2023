using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading;
using AutoMapper;
using Prod.Domain;
using Prod.Domain.Legacy;

namespace SwissKnife.Database
{
    public class Fab3Mapper
    {
        private static Dictionary<string, string> expertGroupReplacements = new Dictionary<string, string>()
        {
            { "ExpertGroups/Fisker/S", "Fisker (Svalbard)" },
            { "ExpertGroups/Marineinvertebrater/S", "Marine invertebrater (Svalbard)" },
            { "ExpertGroups/Fugler/S", "Fugler (Svalbard)" },
            { "ExpertGroups/Testedyr/N", "Testedyr" },
            { "ExpertGroups/Karplanter/S", "Karplanter (Svalbard)" },
            { "ExpertGroups/Pattedyr/S", "Pattedyr (Svalbard)" },
            { "ExpertGroups/Fugler/N", "Fugler" },
            { "ExpertGroups/Pattedyr/N", "Pattedyr" },
            { "ExpertGroups/Rundormerogflatormer/N", "Rundormer og flatormer" },
            { "ExpertGroups/Ikkemarineinvertebrater/N", "Ikke-marine invertebrater" },
            { "ExpertGroups/Moser/N", "Moser" },
            { "ExpertGroups/Marineinvertebrater/N", "Marine invertebrater" },
            { "ExpertGroups/Sopper/N", "Sopper" },
            { "ExpertGroups/Alger/N", "Alger" },
            { "ExpertGroups/Karplanter/N", "Karplanter" },
            { "ExpertGroups/Fisker/N", "Fisker" },
            { "ExpertGroups/Amfibierogreptiler/N", "Amfibier og reptiler" }
        };

        private static Dictionary<string, string> specificExpertGroups = new Dictionary<string, string>()
        {
            { "FA3/N/70", "Terrestriske invertebrater" },
            { "FA3/N/77", "Terrestriske invertebrater" },
            { "FA3/N/145", "Terrestriske invertebrater" },
            { "FA3/N/274", "Terrestriske invertebrater" },
            { "FA3/N/2449", "Terrestriske invertebrater" },
            { "FA3/N/2121", "Terrestriske invertebrater" },
            { "FA3/N/275", "Terrestriske invertebrater" },
            { "FA3/N/2197", "Terrestriske invertebrater" },
            { "FA3/N/276", "Terrestriske invertebrater" },
            { "FA3/N/3313", "Terrestriske invertebrater" },
            { "FA3/N/134", "Terrestriske invertebrater" },
            { "FA3/N/3312", "Terrestriske invertebrater" },
            { "FA3/N/3314", "Terrestriske invertebrater" },
            { "FA3/N/3315", "Terrestriske invertebrater" },
            { "FA3/N/3316", "Terrestriske invertebrater" },
            { "FA3/N/2447", "Terrestriske invertebrater" },
            { "FA3/N/281", "Terrestriske invertebrater" },
            { "FA3/N/3321", "Terrestriske invertebrater" },
            { "FA3/N/12", "Terrestriske invertebrater" },
            { "FA3/N/282", "Terrestriske invertebrater" },
            { "FA3/N/383", "Terrestriske invertebrater" },
            { "FA3/N/384", "Terrestriske invertebrater" },
            { "FA3/N/3151", "Terrestriske invertebrater" },
            { "FA3/N/3264", "Terrestriske invertebrater" },
            { "FA3/N/283", "Terrestriske invertebrater" },
            { "FA3/N/285", "Terrestriske invertebrater" },
            { "FA3/N/3250", "Terrestriske invertebrater" },
            { "FA3/N/2517", "Terrestriske invertebrater" },
            { "FA3/N/3286", "Terrestriske invertebrater" },
            { "FA3/N/3045", "Terrestriske invertebrater" },
            { "FA3/N/2777", "Terrestriske invertebrater" },
            { "FA3/N/2203", "Terrestriske invertebrater" },
            { "FA3/N/2778", "Terrestriske invertebrater" },
            { "FA3/N/286", "Terrestriske invertebrater" },
            { "FA3/N/2704", "Terrestriske invertebrater" },
            { "FA3/N/2714", "Terrestriske invertebrater" },
            { "FA3/N/270", "Terrestriske invertebrater" },
            { "FA3/N/2147", "Terrestriske invertebrater" },
            { "FA3/N/765", "Terrestriske invertebrater" },
            { "FA3/N/2204", "Terrestriske invertebrater" },
            { "FA3/N/2456", "Terrestriske invertebrater" },
            { "FA3/N/2539", "Terrestriske invertebrater" },
            { "FA3/N/2540", "Terrestriske invertebrater" },
            { "FA3/N/582", "Terrestriske invertebrater" },
            { "FA3/N/1059", "Terrestriske invertebrater" },
            { "FA3/N/2075", "Terrestriske invertebrater" },
            { "FA3/N/3016", "Terrestriske invertebrater" },
            { "FA3/N/287", "Terrestriske invertebrater" },
            { "FA3/N/3252", "Terrestriske invertebrater" },
            { "FA3/N/2441", "Terrestriske invertebrater" },
            { "FA3/N/288", "Terrestriske invertebrater" },
            { "FA3/N/289", "Terrestriske invertebrater" },
            { "FA3/N/2205", "Terrestriske invertebrater" },
            { "FA3/N/2206", "Terrestriske invertebrater" },
            { "FA3/N/3066", "Terrestriske invertebrater" },
            { "FA3/N/3067", "Terrestriske invertebrater" },
            { "FA3/N/2766", "Terrestriske invertebrater" },
            { "FA3/N/299", "Terrestriske invertebrater" },
            { "FA3/N/2880", "Terrestriske invertebrater" },
            { "FA3/N/2881", "Terrestriske invertebrater" },
            { "FA3/N/2148", "Terrestriske invertebrater" },
            { "FA3/N/3150", "Terrestriske invertebrater" },
            { "FA3/N/301", "Terrestriske invertebrater" },
            { "FA3/N/583", "Limniske invertebrater" },
            { "FA3/N/302", "Terrestriske invertebrater" },
            { "FA3/N/3172", "Terrestriske invertebrater" },
            { "FA3/N/2686", "Terrestriske invertebrater" },
            { "FA3/N/2699", "Terrestriske invertebrater" },
            { "FA3/N/476", "Terrestriske invertebrater" },
            { "FA3/N/1060", "Terrestriske invertebrater" },
            { "FA3/N/303", "Terrestriske invertebrater" },
            { "FA3/N/3268", "Terrestriske invertebrater" },
            { "FA3/N/304", "Terrestriske invertebrater" },
            { "FA3/N/305", "Terrestriske invertebrater" },
            { "FA3/N/3059", "Terrestriske invertebrater" },
            { "FA3/N/477", "Terrestriske invertebrater" },
            { "FA3/N/491", "Terrestriske invertebrater" },
            { "FA3/N/492", "Terrestriske invertebrater" },
            { "FA3/N/321", "Terrestriske invertebrater" },
            { "FA3/N/322", "Terrestriske invertebrater" },
            { "FA3/N/3017", "Terrestriske invertebrater" },
            { "FA3/N/3155", "Terrestriske invertebrater" },
            { "FA3/N/3161", "Terrestriske invertebrater" },
            { "FA3/N/306", "Terrestriske invertebrater" },
            { "FA3/N/2501", "Terrestriske invertebrater" },
            { "FA3/N/710", "Terrestriske invertebrater" },
            { "FA3/N/2767", "Terrestriske invertebrater" },
            { "FA3/N/2196", "Terrestriske invertebrater" },
            { "FA3/N/2207", "Terrestriske invertebrater" },
            { "FA3/N/2208", "Terrestriske invertebrater" },
            { "FA3/N/2209", "Terrestriske invertebrater" },
            { "FA3/N/3253", "Terrestriske invertebrater" },
            { "FA3/N/308", "Terrestriske invertebrater" },
            { "FA3/N/3247", "Terrestriske invertebrater" },
            { "FA3/N/2541", "Terrestriske invertebrater" },
            { "FA3/N/3070", "Terrestriske invertebrater" },
            { "FA3/N/3069", "Terrestriske invertebrater" },
            { "FA3/N/3068", "Terrestriske invertebrater" },
            { "FA3/N/3158", "Terrestriske invertebrater" },
            { "FA3/N/3249", "Terrestriske invertebrater" },
            { "FA3/N/323", "Terrestriske invertebrater" },
            { "FA3/N/307", "Terrestriske invertebrater" },
            { "FA3/N/2484", "Terrestriske invertebrater" },
            { "FA3/N/2210", "Terrestriske invertebrater" },
            { "FA3/N/324", "Terrestriske invertebrater" },
            { "FA3/N/2211", "Terrestriske invertebrater" },
            { "FA3/N/325", "Terrestriske invertebrater" },
            { "FA3/N/51", "Terrestriske invertebrater" },
            { "FA3/N/2486", "Terrestriske invertebrater" },
            { "FA3/N/327", "Terrestriske invertebrater" },
            { "FA3/N/336", "Terrestriske invertebrater" },
            { "FA3/N/3219", "Terrestriske invertebrater" },
            { "FA3/N/3165", "Terrestriske invertebrater" },
            { "FA3/N/448", "Terrestriske invertebrater" },
            { "FA3/N/2235", "Terrestriske invertebrater" },
            { "FA3/N/3248", "Terrestriske invertebrater" },
            { "FA3/N/329", "Terrestriske invertebrater" },
            { "FA3/N/3343", "Terrestriske invertebrater" },
            { "FA3/N/3258", "Terrestriske invertebrater" },
            { "FA3/N/511", "Terrestriske invertebrater" },
            { "FA3/N/711", "Terrestriske invertebrater" },
            { "FA3/N/2485", "Terrestriske invertebrater" },
            { "FA3/N/3166", "Terrestriske invertebrater" },
            { "FA3/N/516", "Terrestriske invertebrater" },
            { "FA3/N/517", "Terrestriske invertebrater" },
            { "FA3/N/2201", "Terrestriske invertebrater" },
            { "FA3/N/520", "Terrestriske invertebrater" },
            { "FA3/N/447", "Terrestriske invertebrater" },
            { "FA3/N/521", "Terrestriske invertebrater" },
            { "FA3/N/328", "Terrestriske invertebrater" },
            { "FA3/N/3167", "Terrestriske invertebrater" },
            { "FA3/N/2768", "Terrestriske invertebrater" },
            { "FA3/N/523", "Terrestriske invertebrater" },
            { "FA3/N/3221", "Limniske invertebrater" },
            { "FA3/N/528", "Terrestriske invertebrater" },
            { "FA3/N/2478", "Terrestriske invertebrater" },
            { "FA3/N/3257", "Terrestriske invertebrater" },
            { "FA3/N/3256", "Terrestriske invertebrater" },
            { "FA3/N/2074", "Terrestriske invertebrater" },
            { "FA3/N/3307", "Limniske invertebrater" },
            { "FA3/N/3240", "Terrestriske invertebrater" },
            { "FA3/N/330", "Terrestriske invertebrater" },
            { "FA3/N/337", "Terrestriske invertebrater" },
            { "FA3/N/338", "Terrestriske invertebrater" },
            { "FA3/N/339", "Terrestriske invertebrater" },
            { "FA3/N/340", "Terrestriske invertebrater" },
            { "FA3/N/341", "Terrestriske invertebrater" },
            { "FA3/N/2477", "Terrestriske invertebrater" },
            { "FA3/N/331", "Terrestriske invertebrater" },
            { "FA3/N/332", "Terrestriske invertebrater" },
            { "FA3/N/2472", "Terrestriske invertebrater" },
            { "FA3/N/3263", "Terrestriske invertebrater" },
            { "FA3/N/333", "Terrestriske invertebrater" },
            { "FA3/N/968", "Terrestriske invertebrater" },
            { "FA3/N/2758", "Terrestriske invertebrater" },
            { "FA3/N/260", "Terrestriske invertebrater" },
            { "FA3/N/969", "Terrestriske invertebrater" },
            { "FA3/N/2490", "Terrestriske invertebrater" },
            { "FA3/N/334", "Terrestriske invertebrater" },
            { "FA3/N/2681", "Limniske invertebrater" },
            { "FA3/N/2684", "Limniske invertebrater" },
            { "FA3/N/2392", "Terrestriske invertebrater" },
            { "FA3/N/131", "Terrestriske invertebrater" },
            { "FA3/N/526", "Terrestriske invertebrater" },
            { "FA3/N/1142", "Terrestriske invertebrater" },
            { "FA3/N/3229", "Terrestriske invertebrater" },
            { "FA3/N/3168", "Terrestriske invertebrater" },
            { "FA3/N/712", "Terrestriske invertebrater" },
            { "FA3/N/705", "Terrestriske invertebrater" },
            { "FA3/N/342", "Terrestriske invertebrater" },
            { "FA3/N/343", "Terrestriske invertebrater" },
            { "FA3/N/344", "Terrestriske invertebrater" },
            { "FA3/N/345", "Terrestriske invertebrater" },
            { "FA3/N/346", "Terrestriske invertebrater" },
            { "FA3/N/1061", "Terrestriske invertebrater" },
            { "FA3/N/4061", "Terrestriske invertebrater" },
            { "FA3/N/2482", "Terrestriske invertebrater" },
            { "FA3/N/3169", "Terrestriske invertebrater" },
            { "FA3/N/1056", "Terrestriske invertebrater" },
            { "FA3/N/2479", "Terrestriske invertebrater" },
            { "FA3/N/2716", "Terrestriske invertebrater" },
            { "FA3/N/2891", "Limniske invertebrater" },
            { "FA3/N/335", "Terrestriske invertebrater" },
            { "FA3/N/3160", "Terrestriske invertebrater" },
            { "FA3/N/3156", "Terrestriske invertebrater" },
            { "FA3/N/2438", "Terrestriske invertebrater" },
            { "FA3/N/3282", "Terrestriske invertebrater" },
            { "FA3/N/1892", "Terrestriske invertebrater" },
            { "FA3/N/2759", "Terrestriske invertebrater" },
            { "FA3/N/3270", "Terrestriske invertebrater" },
            { "FA3/N/2669", "Limniske invertebrater" },
            { "FA3/N/2671", "Limniske invertebrater" },
            { "FA3/N/1443", "Terrestriske invertebrater" },
            { "FA3/N/279", "Terrestriske invertebrater" },
            { "FA3/N/1442", "Terrestriske invertebrater" },
            { "FA3/N/294", "Terrestriske invertebrater" },
            { "FA3/N/293", "Terrestriske invertebrater" },
            { "FA3/N/3222", "Terrestriske invertebrater" },
            { "FA3/N/3157", "Terrestriske invertebrater" },
            { "FA3/N/713", "Terrestriske invertebrater" },
            { "FA3/N/2395", "Terrestriske invertebrater" },
            { "FA3/N/2892", "Terrestriske invertebrater" },
            { "FA3/N/2717", "Terrestriske invertebrater" },
            { "FA3/N/347", "Terrestriske invertebrater" },
            { "FA3/N/2769", "Terrestriske invertebrater" },
            { "FA3/N/2542", "Terrestriske invertebrater" },
            { "FA3/N/2543", "Terrestriske invertebrater" },
            { "FA3/N/2544", "Terrestriske invertebrater" },
            { "FA3/N/2455", "Terrestriske invertebrater" },
            { "FA3/N/2454", "Terrestriske invertebrater" },
            { "FA3/N/52", "Terrestriske invertebrater" },
            { "FA3/N/2453", "Terrestriske invertebrater" },
            { "FA3/N/2458", "Terrestriske invertebrater" },
            { "FA3/N/2718", "Terrestriske invertebrater" },
            { "FA3/N/3040", "Terrestriske invertebrater" },
            { "FA3/N/3230", "Terrestriske invertebrater" },
            { "FA3/N/2473", "Limniske invertebrater" },
            { "FA3/N/2086", "Terrestriske invertebrater" },
            { "FA3/N/348", "Terrestriske invertebrater" },
            { "FA3/N/3171", "Terrestriske invertebrater" },
            { "FA3/N/3173", "Terrestriske invertebrater" },
            { "FA3/N/2468", "Terrestriske invertebrater" },
            { "FA3/N/714", "Terrestriske invertebrater" },
            { "FA3/N/3225", "Terrestriske invertebrater" },
            { "FA3/N/300", "Terrestriske invertebrater" },
            { "FA3/N/2398", "Terrestriske invertebrater" },
            { "FA3/N/773", "Terrestriske invertebrater" },
            { "FA3/N/2515", "Terrestriske invertebrater" },
            { "FA3/N/349", "Terrestriske invertebrater" },
            { "FA3/N/98", "Terrestriske invertebrater" },
            { "FA3/N/350", "Terrestriske invertebrater" },
            { "FA3/N/2491", "Terrestriske invertebrater" },
            { "FA3/N/2432", "Terrestriske invertebrater" },
            { "FA3/N/351", "Terrestriske invertebrater" },
            { "FA3/N/3174", "Terrestriske invertebrater" },
            { "FA3/N/352", "Terrestriske invertebrater" },
            { "FA3/N/3345", "Terrestriske invertebrater" },
            { "FA3/N/261", "Terrestriske invertebrater" },
            { "FA3/N/1445", "Terrestriske invertebrater" },
            { "FA3/N/2757", "Terrestriske invertebrater" },
            { "FA3/N/1141", "Terrestriske invertebrater" },
            { "FA3/N/57", "Terrestriske invertebrater" },
            { "FA3/N/2882", "Terrestriske invertebrater" },
            { "FA3/N/53", "Terrestriske invertebrater" },
            { "FA3/N/584", "Terrestriske invertebrater" },
            { "FA3/N/457", "Terrestriske invertebrater" },
            { "FA3/N/1062", "Terrestriske invertebrater" },
            { "FA3/N/2886", "Terrestriske invertebrater" },
            { "FA3/N/355", "Terrestriske invertebrater" },
            { "FA3/N/1070", "Terrestriske invertebrater" },
            { "FA3/N/356", "Terrestriske invertebrater" },
            { "FA3/N/611", "Terrestriske invertebrater" },
            { "FA3/N/3226", "Terrestriske invertebrater" },
            { "FA3/N/357", "Terrestriske invertebrater" },
            { "FA3/N/316", "Terrestriske invertebrater" },
            { "FA3/N/2416", "Terrestriske invertebrater" },
            { "FA3/N/3260", "Terrestriske invertebrater" },
            { "FA3/N/731", "Terrestriske invertebrater" },
            { "FA3/N/40", "Terrestriske invertebrater" },
            { "FA3/N/1878", "Terrestriske invertebrater" },
            { "FA3/N/3041", "Terrestriske invertebrater" },
            { "FA3/N/3060", "Terrestriske invertebrater" },
            { "FA3/N/3061", "Terrestriske invertebrater" },
            { "FA3/N/2498", "Terrestriske invertebrater" },
            { "FA3/N/358", "Terrestriske invertebrater" },
            { "FA3/N/2088", "Terrestriske invertebrater" },
            { "FA3/N/359", "Terrestriske invertebrater" },
            { "FA3/N/2427", "Terrestriske invertebrater" },
            { "FA3/N/2444", "Terrestriske invertebrater" },
            { "FA3/N/769", "Terrestriske invertebrater" },
            { "FA3/N/970", "Terrestriske invertebrater" },
            { "FA3/N/715", "Terrestriske invertebrater" },
            { "FA3/N/2497", "Terrestriske invertebrater" },
            { "FA3/N/3159", "Terrestriske invertebrater" },
            { "FA3/N/2779", "Terrestriske invertebrater" },
            { "FA3/N/2212", "Terrestriske invertebrater" },
            { "FA3/N/3064", "Terrestriske invertebrater" },
            { "FA3/N/3062", "Terrestriske invertebrater" },
            { "FA3/N/3063", "Terrestriske invertebrater" },
            { "FA3/N/2213", "Terrestriske invertebrater" },
            { "FA3/N/2483", "Terrestriske invertebrater" },
            { "FA3/N/3228", "Terrestriske invertebrater" },
            { "FA3/N/3281", "Terrestriske invertebrater" },
            { "FA3/N/3227", "Terrestriske invertebrater" },
            { "FA3/N/1063", "Terrestriske invertebrater" },
            { "FA3/N/2883", "Terrestriske invertebrater" },
            { "FA3/N/2092", "Terrestriske invertebrater" },
            { "FA3/N/2760", "Terrestriske invertebrater" },
            { "FA3/N/3081", "Terrestriske invertebrater" },
            { "FA3/N/3065", "Terrestriske invertebrater" },
            { "FA3/N/2775", "Terrestriske invertebrater" },
            { "FA3/N/360", "Terrestriske invertebrater" },
            { "FA3/N/716", "Terrestriske invertebrater" },
            { "FA3/N/361", "Terrestriske invertebrater" },
            { "FA3/N/1064", "Terrestriske invertebrater" },
            { "FA3/N/3082", "Terrestriske invertebrater" },
            { "FA3/N/2504", "Terrestriske invertebrater" },
            { "FA3/N/2761", "Terrestriske invertebrater" },
            { "FA3/N/3347", "Terrestriske invertebrater" },
            { "FA3/N/2443", "Terrestriske invertebrater" },
            { "FA3/N/2762", "Terrestriske invertebrater" },
            { "FA3/N/291", "Terrestriske invertebrater" },
            { "FA3/N/2448", "Terrestriske invertebrater" },
            { "FA3/N/311", "Terrestriske invertebrater" },
            { "FA3/N/362", "Terrestriske invertebrater" },
            { "FA3/N/2488", "Terrestriske invertebrater" },
            { "FA3/N/2693", "Terrestriske invertebrater" },
            { "FA3/N/599", "Terrestriske invertebrater" },
            { "FA3/N/2492", "Terrestriske invertebrater" },
            { "FA3/N/2087", "Terrestriske invertebrater" },
            { "FA3/N/2214", "Terrestriske invertebrater" },
            { "FA3/N/717", "Terrestriske invertebrater" },
            { "FA3/N/718", "Terrestriske invertebrater" },
            { "FA3/N/2090", "Terrestriske invertebrater" },
            { "FA3/N/2082", "Terrestriske invertebrater" },
            { "FA3/N/706", "Terrestriske invertebrater" },
            { "FA3/N/728", "Terrestriske invertebrater" },
            { "FA3/N/3259", "Terrestriske invertebrater" },
            { "FA3/N/2234", "Terrestriske invertebrater" },
            { "FA3/N/317", "Terrestriske invertebrater" },
            { "FA3/N/3241", "Terrestriske invertebrater" },
            { "FA3/N/363", "Terrestriske invertebrater" },
            { "FA3/N/2084", "Terrestriske invertebrater" },
            { "FA3/N/2487", "Terrestriske invertebrater" },
            { "FA3/N/585", "Terrestriske invertebrater" },
            { "FA3/N/364", "Terrestriske invertebrater" },
            { "FA3/N/986", "Terrestriske invertebrater" },
            { "FA3/N/2404", "Terrestriske invertebrater" },
            { "FA3/N/365", "Terrestriske invertebrater" },
            { "FA3/N/2502", "Terrestriske invertebrater" },
            { "FA3/N/3153", "Terrestriske invertebrater" },
            { "FA3/N/3220", "Limniske invertebrater" },
            { "FA3/N/296", "Terrestriske invertebrater" },
            { "FA3/N/366", "Terrestriske invertebrater" },
            { "FA3/N/2089", "Terrestriske invertebrater" },
            { "FA3/N/2720", "Terrestriske invertebrater" },
            { "FA3/N/367", "Terrestriske invertebrater" },
            { "FA3/N/368", "Terrestriske invertebrater" },
            { "FA3/N/2439", "Terrestriske invertebrater" },
            { "FA3/N/369", "Terrestriske invertebrater" },
            { "FA3/N/2440", "Terrestriske invertebrater" },
            { "FA3/N/2770", "Terrestriske invertebrater" },
            { "FA3/N/2771", "Terrestriske invertebrater" },
            { "FA3/N/2467", "Terrestriske invertebrater" },
            { "FA3/N/719", "Terrestriske invertebrater" },
            { "FA3/N/370", "Terrestriske invertebrater" },
            { "FA3/N/3083", "Terrestriske invertebrater" },
            { "FA3/N/3084", "Terrestriske invertebrater" },
            { "FA3/N/2149", "Terrestriske invertebrater" },
            { "FA3/N/3359", "Terrestriske invertebrater" },
            { "FA3/N/988", "Terrestriske invertebrater" },
            { "FA3/N/56", "Terrestriske invertebrater" },
            { "FA3/N/761", "Terrestriske invertebrater" },
            { "FA3/N/3154", "Terrestriske invertebrater" },
            { "FA3/N/989", "Terrestriske invertebrater" },
            { "FA3/N/3242", "Terrestriske invertebrater" },
            { "FA3/N/371", "Terrestriske invertebrater" },
            { "FA3/N/372", "Terrestriske invertebrater" },
            { "FA3/N/2198", "Terrestriske invertebrater" },
            { "FA3/N/990", "Terrestriske invertebrater" },
            { "FA3/N/991", "Terrestriske invertebrater" },
            { "FA3/N/720", "Terrestriske invertebrater" },
            { "FA3/N/721", "Terrestriske invertebrater" },
            { "FA3/N/612", "Terrestriske invertebrater" },
            { "FA3/N/3251", "Terrestriske invertebrater" },
            { "FA3/N/373", "Terrestriske invertebrater" },
            { "FA3/N/2215", "Terrestriske invertebrater" },
            { "FA3/N/2216", "Terrestriske invertebrater" },
            { "FA3/N/993", "Terrestriske invertebrater" },
            { "FA3/N/54", "Terrestriske invertebrater" },
            { "FA3/N/3285", "Terrestriske invertebrater" },
            { "FA3/N/2417", "Terrestriske invertebrater" },
            { "FA3/N/2628", "Terrestriske invertebrater" },
            { "FA3/N/2418", "Terrestriske invertebrater" },
            { "FA3/N/55", "Terrestriske invertebrater" },
            { "FA3/N/3284", "Terrestriske invertebrater" },
            { "FA3/N/3283", "Terrestriske invertebrater" },
            { "FA3/N/2420", "Terrestriske invertebrater" },
            { "FA3/N/2421", "Terrestriske invertebrater" },
            { "FA3/N/972", "Terrestriske invertebrater" },
            { "FA3/N/2150", "Terrestriske invertebrater" },
            { "FA3/N/1065", "Terrestriske invertebrater" },
            { "FA3/N/2481", "Terrestriske invertebrater" },
            { "FA3/N/3266", "Terrestriske invertebrater" },
            { "FA3/N/69", "Limniske invertebrater" },
            { "FA3/N/2217", "Terrestriske invertebrater" },
            { "FA3/N/2218", "Terrestriske invertebrater" },
            { "FA3/N/3342", "Terrestriske invertebrater" },
            { "FA3/N/2687", "Terrestriske invertebrater" },
            { "FA3/N/3287", "Terrestriske invertebrater" },
            { "FA3/N/2451", "Terrestriske invertebrater" },
            { "FA3/N/3085", "Terrestriske invertebrater" },
            { "FA3/N/2091", "Terrestriske invertebrater" },
            { "FA3/N/2763", "Terrestriske invertebrater" },
            { "FA3/N/375", "Terrestriske invertebrater" },
            { "FA3/N/2688", "Terrestriske invertebrater" },
            { "FA3/N/2689", "Terrestriske invertebrater" },
            { "FA3/N/2690", "Terrestriske invertebrater" },
            { "FA3/N/312", "Terrestriske invertebrater" },
            { "FA3/N/3235", "Terrestriske invertebrater" },
            { "FA3/N/3086", "Terrestriske invertebrater" },
            { "FA3/N/3050", "Terrestriske invertebrater" },
            { "FA3/N/2500", "Terrestriske invertebrater" },
            { "FA3/N/374", "Terrestriske invertebrater" },
            { "FA3/N/2433", "Terrestriske invertebrater" },
            { "FA3/N/2434", "Terrestriske invertebrater" },
            { "FA3/N/2435", "Terrestriske invertebrater" },
            { "FA3/N/2452", "Terrestriske invertebrater" },
            { "FA3/N/2765", "Terrestriske invertebrater" },
            { "FA3/N/2200", "Terrestriske invertebrater" },
            { "FA3/N/2233", "Terrestriske invertebrater" },
            { "FA3/N/613", "Terrestriske invertebrater" },
            { "FA3/N/3051", "Terrestriske invertebrater" },
            { "FA3/N/3052", "Terrestriske invertebrater" },
            { "FA3/N/2232", "Terrestriske invertebrater" },
            { "FA3/N/1066", "Limniske invertebrater" },
            { "FA3/N/586", "Limniske invertebrater" },
            { "FA3/N/3243", "Terrestriske invertebrater" },
            { "FA3/N/3246", "Terrestriske invertebrater" },
            { "FA3/N/2772", "Terrestriske invertebrater" },
            { "FA3/N/2508", "Terrestriske invertebrater" },
            { "FA3/N/3265", "Terrestriske invertebrater" },
            { "FA3/N/3322", "Terrestriske invertebrater" },
            { "FA3/N/3053", "Terrestriske invertebrater" },
            { "FA3/N/722", "Terrestriske invertebrater" },
            { "FA3/N/973", "Terrestriske invertebrater" },
            { "FA3/N/2231", "Terrestriske invertebrater" },
            { "FA3/N/2665", "Limniske invertebrater" },
            { "FA3/N/3164", "Terrestriske invertebrater" },
            { "FA3/N/3163", "Terrestriske invertebrater" },
            { "FA3/N/2890", "Limniske invertebrater" },
            { "FA3/N/3231", "Terrestriske invertebrater" },
            { "FA3/N/2457", "Terrestriske invertebrater" },
            { "FA3/N/723", "Terrestriske invertebrater" },
            { "FA3/N/2764", "Terrestriske invertebrater" },
            { "FA3/N/2228", "Terrestriske invertebrater" },
            { "FA3/N/2202", "Terrestriske invertebrater" },
            { "FA3/N/146", "Terrestriske invertebrater" },
            { "FA3/N/2780", "Terrestriske invertebrater" },
            { "FA3/N/2230", "Terrestriske invertebrater" },
            { "FA3/N/2781", "Terrestriske invertebrater" },
            { "FA3/N/2695", "Terrestriske invertebrater" },
            { "FA3/N/58", "Terrestriske invertebrater" },
            { "FA3/N/3244", "Terrestriske invertebrater" },
            { "FA3/N/147", "Terrestriske invertebrater" },
            { "FA3/N/2409", "Terrestriske invertebrater" },
            { "FA3/N/2411", "Terrestriske invertebrater" },
            { "FA3/N/3361", "Terrestriske invertebrater" },
            { "FA3/N/2073", "Terrestriske invertebrater" },
            { "FA3/N/1913", "Terrestriske invertebrater" },
            { "FA3/N/133", "Terrestriske invertebrater" },
            { "FA3/N/2691", "Terrestriske invertebrater" },
            { "FA3/N/724", "Terrestriske invertebrater" },
            { "FA3/N/76", "Terrestriske invertebrater" },
            { "FA3/N/2227", "Terrestriske invertebrater" },
            { "FA3/N/3245", "Terrestriske invertebrater" },
            { "FA3/N/3223", "Terrestriske invertebrater" },
            { "FA3/N/2380", "Terrestriske invertebrater" },
            { "FA3/N/2236", "Terrestriske invertebrater" },
            { "FA3/N/2226", "Terrestriske invertebrater" },
            { "FA3/N/2225", "Terrestriske invertebrater" },
            { "FA3/N/2224", "Terrestriske invertebrater" },
            { "FA3/N/2773", "Terrestriske invertebrater" },
            { "FA3/N/3054", "Terrestriske invertebrater" },
            { "FA3/N/3087", "Terrestriske invertebrater" },
            { "FA3/N/3360", "Terrestriske invertebrater" },
            { "FA3/N/725", "Terrestriske invertebrater" },
            { "FA3/N/3319", "Terrestriske invertebrater" },
            { "FA3/N/3326", "Terrestriske invertebrater" },
            { "FA3/N/3224", "Terrestriske invertebrater" },
            { "FA3/N/2229", "Terrestriske invertebrater" },
            { "FA3/N/3044", "Terrestriske invertebrater" },
            { "FA3/N/726", "Terrestriske invertebrater" },
            { "FA3/N/2076", "Terrestriske invertebrater" },
            { "FA3/N/974", "Terrestriske invertebrater" },
            { "FA3/N/756", "Terrestriske invertebrater" },
            { "FA3/N/2489", "Terrestriske invertebrater" },
            { "FA3/N/1673", "Terrestriske invertebrater" },
            { "FA3/N/1674", "Terrestriske invertebrater" },
            { "FA3/N/1675", "Terrestriske invertebrater" },
            { "FA3/N/3237", "Terrestriske invertebrater" },
            { "FA3/N/3057", "Terrestriske invertebrater" },
            { "FA3/N/3088", "Terrestriske invertebrater" },
            { "FA3/N/1502", "Terrestriske invertebrater" },
            { "FA3/N/2696", "Terrestriske invertebrater" },
            { "FA3/N/2697", "Terrestriske invertebrater" },
            { "FA3/N/2887", "Terrestriske invertebrater" },
            { "FA3/N/3079", "Terrestriske invertebrater" },
            { "FA3/N/2503", "Terrestriske invertebrater" },
            { "FA3/N/3236", "Terrestriske invertebrater" },
            { "FA3/N/2459", "Terrestriske invertebrater" },
            { "FA3/N/760", "Terrestriske invertebrater" },
            { "FA3/N/2505", "Terrestriske invertebrater" },
            { "FA3/N/2506", "Terrestriske invertebrater" },
            { "FA3/N/385", "Terrestriske invertebrater" },
            { "FA3/N/2223", "Terrestriske invertebrater" },
            { "FA3/N/534", "Terrestriske invertebrater" },
            { "FA3/N/2509", "Terrestriske invertebrater" },
            { "FA3/N/3058", "Terrestriske invertebrater" },
            { "FA3/N/2437", "Terrestriske invertebrater" },
            { "FA3/N/386", "Terrestriske invertebrater" },
            { "FA3/N/3232", "Terrestriske invertebrater" },
            { "FA3/N/2776", "Terrestriske invertebrater" },
            { "FA3/N/1440", "Terrestriske invertebrater" },
            { "FA3/N/1439", "Terrestriske invertebrater" },
            { "FA3/N/2423", "Terrestriske invertebrater" },
            { "FA3/N/3325", "Terrestriske invertebrater" },
            { "FA3/N/2222", "Terrestriske invertebrater" },
            { "FA3/N/2774", "Terrestriske invertebrater" },
            { "FA3/N/3261", "Terrestriske invertebrater" },
            { "FA3/N/727", "Terrestriske invertebrater" },
            { "FA3/N/2221", "Terrestriske invertebrater" },
            { "FA3/N/2220", "Terrestriske invertebrater" },
            { "FA3/N/2219", "Terrestriske invertebrater" },
            { "FA3/N/387", "Terrestriske invertebrater" },
            { "FA3/N/388", "Terrestriske invertebrater" },
            { "FA3/N/37", "Terrestriske invertebrater" },
            { "FA3/N/3255", "Terrestriske invertebrater" },
            { "FA3/N/389", "Terrestriske invertebrater" },
            { "FA3/N/390", "Terrestriske invertebrater" },
            { "FA3/N/391", "Terrestriske invertebrater" },
            { "FA3/N/3262", "Terrestriske invertebrater" },
            { "FA3/N/3210", "Terrestriske invertebrater" },
            { "FA3/N/3269", "Terrestriske invertebrater" },
            { "FA3/N/392", "Terrestriske invertebrater" },
            { "FA3/N/992", "Terrestriske invertebrater" },
            { "FA3/N/2470", "Terrestriske invertebrater" },
            { "FA3/N/1067", "Terrestriske invertebrater" },
            { "FA3/N/525", "Terrestriske invertebrater" },
            { "FA3/N/3162", "Terrestriske invertebrater" },
            { "FA3/N/1068", "Terrestriske invertebrater" },
            { "FA3/N/3346", "Terrestriske invertebrater" },
            { "FA3/N/3233", "Terrestriske invertebrater" },
            { "FA3/N/3344", "Terrestriske invertebrater" }
        };

        private static Dictionary<string, string> naturetypes;
        private static Dictionary<string, string> naturetypes2_2;

        private static Dictionary<string, string> Naturetypes
        {
            get
            {
                if (naturetypes != null)
                {
                    return naturetypes;
                }

                var nin = ParseJson("/Prod.Web/src/Nin2_3.json");
                var dict = DrillDown(nin["Children"].AsArray()).ToDictionary(item => item.Item1.Substring(3), item => item.Item2);

                var nin2 = ParseJson("/Prod.Web/src/TrueteOgSjeldneNaturtyper2018.json");
                foreach (var item in DrillDown(nin2["Children"].AsArray()))
                {
                    dict.Add(item.Item1, item.Item2);
                }

                //var nin1 = ParseJson("/Prod.Web/src/Nin2_2.json");
                //foreach (var item in DrillDown(nin2["Children"].AsArray()).Where(item => !dict.ContainsKey(item.Item1)))
                //{
                //    dict.Add(item.Item1, item.Item2);
                //}
                var ninl1 = ParseJson("/Prod.Web/src/nin-livsmedium.json");
                foreach (var item in DrillDown(ninl1["children"].AsArray(), "Id", "navn", "children").Where(item => !dict.ContainsKey(item.Item1)))
                {
                    dict.Add(item.Item1, item.Item2);
                }

                naturetypes = dict;
                return dict;
            }
        }
        private static Dictionary<string, string> Naturetypes2_2
        {
            get
            {
                if (naturetypes2_2 != null)
                {
                    return naturetypes2_2;
                }
                
                var nin = ParseJson("/Prod.Web/src/Nin2_2.json");
                var dict = DrillDown(nin["Children"].AsArray()).ToDictionary(item => item.Item1.Substring(3), item => item.Item2);

                naturetypes2_2 = dict;
                return dict;
            }
        }
        public static Mapper CreateMappingFromOldToNew()
        { 
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                
                cfg.CreateMap<FA3Legacy.NaturalOrigin, FA4.NaturalOrigin>();
                cfg.CreateMap<FA3Legacy.RedlistedNatureType, FA4.RedlistedNatureType>()
                    .ForMember(dest => dest.Background, opt => opt.Ignore());
                cfg.CreateMap<FA3Legacy.Reference, FA4.SimpleReference>();
                cfg.CreateMap<FA3Legacy.RegionalRiskAssessment, FA4.RegionalRiskAssessment>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Criterion, Prod.Domain.RiskAssessment.Criterion>()
                    .ForMember(dest => dest.Auto, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.HostParasiteInteraction,
                        Prod.Domain.RiskAssessment.HostParasiteInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.Status, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Interaction, Prod.Domain.RiskAssessment.Interaction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.NaturetypeInteraction,
                        Prod.Domain.RiskAssessment.NaturetypeInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesInteraction,
                        Prod.Domain.RiskAssessment.SpeciesInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesNaturetypeInteraction,
                        Prod.Domain.RiskAssessment.SpeciesNaturetypeInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.Name, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesSpeciesInteraction,
                        Prod.Domain.RiskAssessment.SpeciesSpeciesInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());

                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment, Prod.Domain.RiskAssessment>()

                    .ForMember(dest => dest.Naturetype2018, opt => opt.Ignore())
                    .ForMember(dest => dest.NaturetypeNIN2, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundC, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundF, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundG, opt => opt.Ignore())
                    .ForMember(dest => dest.AcceptOrAdjustCritA, opt => opt.Ignore())
                    .ForMember(dest => dest.ReasonForAdjustmentCritA, opt => opt.Ignore())
                    .ForMember(dest => dest.Hovedøkosystem, opt => opt.Ignore())

                    .ForMember(dest => dest.FilesDescription, opt => opt.Ignore())

                    .ForMember(dest => dest.StartYear, opt => opt.Ignore())
                    .ForMember(dest => dest.EndYear, opt => opt.Ignore())
                    // todo: delete this section when domain is fixed
                    //.ForMember(dest => dest.ScoreA, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureA, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreB, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureB, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreC, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureC, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreD, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureD, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreE, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureE, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreF, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureF, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreG, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureG, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreH, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureH, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreI, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureI, opt => opt.Ignore())
                    // --------------------------------
                    .ForMember(dest => dest.PossibleLowerCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.NatureAffectedAbroadF, opt => opt.Ignore())
                    .ForMember(dest => dest.NatureAffectedAbroadG, opt => opt.Ignore())

                    .ForMember(dest => dest.PopulationSize, opt => opt.MapFrom<long>(src => ParseLongFromNullableInt(src.SpreadRscriptSpeciesCount)))
                    .ForMember(dest => dest.GrowthRate, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptPopulationGrowth, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.EnvVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptEnvironmantVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.DemVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptDemographicVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.CarryingCapacity, opt => opt.MapFrom<long?>(src => ParseLong(src.SpreadRscriptSustainabilityK)))
                    .ForMember(dest => dest.ExtinctionThreshold, opt => opt.MapFrom<long?>(src => ParseLong(src.SpreadRscriptQuasiExtinctionThreshold)))
                    .ForMember(dest => dest.MedianLifetimeInput, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadRscriptEstimatedSpeciesLongevity))) //ActiveSpreadRscriptEstimatedSpeciesLongevity?? ChosenSpreadMedanLifespan??
                    .ForMember(dest => dest.MedianLifetime, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeLowerQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeLowerQ, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeUpperQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeUpperQ, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeedInput, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseObservations)))
                    .ForMember(dest => dest.ExpansionLowerQInput, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseObservationsLowerQuartile)))
                    .ForMember(dest => dest.ExpansionUpperQInput, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseObservationsUpperQuartile)))
                    .ForMember(dest => dest.IntroductionsBest, opt => opt.Ignore())
                    .ForMember(dest => dest.IntroductionsLow, opt => opt.Ignore())
                    .ForMember(dest => dest.IntroductionsHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeedInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeed, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceArea))) // ActiveSpreadYearlyIncreaseOccurrenceArea?? SpreadYearlyIncreaseCalculatedExpansionSpeed?? SpreadYearlyIncreaseObservations??
                    .ForMember(dest => dest.ExpansionLowerQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionLowerQ, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceAreaLowerQuartile)))
                    .ForMember(dest => dest.ExpansionUpperQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionUpperQ, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceAreaUpperQuartile)))

                    // følgende blir mappet fra FA3Legacy lenger nede
                    .ForMember(dest => dest.AOOknownInput, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOknown, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOknown1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOknown2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalBestInput, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalLowInput, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalHighInput, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrBestInput, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrLowInput, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrHighInput, opt => opt.Ignore())
                    .ForMember(dest => dest.NotUseSpeciesMap, opt => opt.Ignore())                    

                    .ForMember(dest => dest.Amethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Ascore, opt => opt.Ignore())
                    .ForMember(dest => dest.Alow, opt => opt.Ignore())
                    .ForMember(dest => dest.Ahigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.ApossibleLow, opt => opt.Ignore())
                    .ForMember(dest => dest.ApossibleHigh, opt => opt.Ignore())


                    .ForMember(dest => dest.Bmethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Bscore, opt => opt.Ignore())
                    .ForMember(dest => dest.Blow, opt => opt.Ignore())
                    .ForMember(dest => dest.Bhigh, opt => opt.Ignore())

                    .ForMember(dest => dest.BCritMCount, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritExact, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritP, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritModel, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritOccurrences, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritNewObs, opt => opt.Ignore())

                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh, opt => opt.Ignore())
                    
                    .ForMember(dest => dest.YearFirstIndoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstIndoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionIndoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionIndoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstProductionOutdoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstProductionOutdoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionOutdoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionOutdoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishmentProductionArea, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishmentProductionAreaInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstNature, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstNatureInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionNature, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionNatureInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishedNature, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishedNatureInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstDomesticObservation, opt => opt.Ignore())
                    .AfterMap((src, dest) =>
                    {
                        if (src.ChosenSpreadYearlyIncrease == "SpreadYearlyIncreaseCalculatedExpansionSpeed")
                        {
                            dest.ChosenSpreadYearlyIncrease = "a";
                        }
                    });
                //.ForMember(dest => dest., opt => opt.MapFrom(src => src.))



                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathway, Prod.Domain.MigrationPathway>();
                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathwayCode, Prod.Domain.MigrationPathwayCode>();
                cfg.CreateMap<Prod.Domain.Legacy.SpreadHistory, Prod.Domain.SpreadHistory>();
                //cfg.CreateMap<Prod.Domain.Legacy.Kode, Prod.Domain.Kode>();
                //cfg.CreateMap<Prod.Domain.Legacy.KodeGrupper, Prod.Domain.KodeGrupper>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCode, Prod.Domain.RedlistedNatureTypeCode>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCodeGroup, Prod.Domain.RedlistedNatureTypeCodeGroup>();
                
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresence, Prod.Domain.RegionalPresence>();
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresenceWithPotential, Prod.Domain.RegionalPresenceWithPotential>();
                cfg.CreateMap<FA3Legacy.ImpactedNatureType, FA4.ImpactedNatureType>()
                    .ForMember(dest => dest.Background, opt => opt.Ignore())
                    .ForMember(dest => dest.Name, opt => opt.Ignore())
                    .ForMember(dest => dest.NatureTypeArea, opt => opt.Ignore());
                cfg.CreateMap<FA3Legacy.TimeAndPlace, FA4.TimeAndPlace>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablished, FA4.ObservedAndEstablished>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablishedInCountry, FA4.ObservedAndEstablishedInCountry>();
                cfg.CreateMap<FA3Legacy, FA4>()
                    .ForMember(dest => dest.Category, opt => opt.Ignore())
                    .ForMember(dest => dest.Criteria, opt => opt.Ignore())
                    .ForMember(dest => dest.AssessmentConclusion, opt => opt.Ignore())
                    .ForMember(dest => dest.IsAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.IsAlienSpecies, opt => opt.Ignore())
                    .ForMember(dest => dest.IsRegionallyAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.Connected, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedToAnother, opt => opt.Ignore())
                    .ForMember(dest => dest.HigherOrLowerLevel, opt => opt.Ignore())
                    .ForMember(dest => dest.SpeciesStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.AssumedReproducing50Years, opt => opt.Ignore())
                    .ForMember(dest => dest.ProductionSpecies, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedTaxon, opt => opt.Ignore())
                    .ForMember(dest => dest.ChangedFromAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.ChangedAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.ReasonForChangeOfCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.IndoorProduktion, opt => opt.Ignore())
                    .ForMember(dest => dest.CoastLineSections, opt => opt.Ignore())
                    .ForMember(dest => dest.ArcticBioClimateZones, opt => opt.Ignore())
                    .ForMember(dest => dest.CurrentBioClimateZones, opt => opt.Ignore())
                    .ForMember(dest => dest.LastUpdatedBy, opt => opt.MapFrom(src => src.SistOppdatertAv))
                    .ForMember(dest => dest.LastUpdatedAt, opt => opt.MapFrom(src => src.SistOppdatert))
                    .ForMember(dest => dest.LockedForEditAt,
                        opt => opt.MapFrom(src => src.SistOppdatert)) // må ha dato - bruker en kjent en
                    .ForMember(dest => dest.LockedForEditBy, opt => opt.Ignore())
                    .ForMember(dest => dest.LockedForEditByUserId, opt => opt.Ignore())
                    .ForMember(dest => dest.EvaluationStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.TaxonHierarcy, opt => opt.Ignore())
                    .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                    //.ForMember(dest => dest.VurderingId2018, opt => opt.MapFrom(src => src.Id))
                    .ForMember(dest => dest.HorizonDoScanning, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonScanResult, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonScanningStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffect, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffectDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotential, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotentialDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadAreaInChangedNature, opt => opt.Ignore())
                    .ForMember(dest => dest.SpeciesEstablishmentCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.Id, opt => opt.Ignore()) // primærnøkkel
                    .ForMember(dest => dest.PreviousAssessments, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.Fylkesforekomster, opt => opt.Ignore())
                    .ForMember(dest => dest.TaxonomicHistory, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ImportInfo, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.EvaluatedScientificNameRank, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartAdded, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartRemoved, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartSelectionGeometry, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartSistOverført, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartModel, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartWaterModel, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.Habitats, opt => opt.Ignore())  // ny av året
                    .ForMember(dest => dest.ImpactedNatureTypesFrom2018, opt => opt.Ignore()) // kun for plassering av ikke kompatible naturtyper
                    .AfterMap((src, dest) =>
                    {
                        // set some standard values
                        dest.EvaluationStatus = "imported";
                        dest.HorizonScanningStatus = "notStarted";
                        dest.TaxonHierarcy = "";
                        dest.IsDeleted = false;
                        if (string.IsNullOrWhiteSpace(dest.ExpertGroup) && !string.IsNullOrWhiteSpace(src.ExpertGroupId) && expertGroupReplacements.ContainsKey(src.ExpertGroupId))
                        {
                            dest.ExpertGroup = expertGroupReplacements[src.ExpertGroupId];
                        }
                        if (!string.IsNullOrWhiteSpace(src.Id) && specificExpertGroups.ContainsKey(src.Id))
                        {
                            dest.ExpertGroup = specificExpertGroups[src.Id];
                        }

                        dest.PreviousAssessments.Add(new FA4.PreviousAssessment()
                        {
                            AssessmentId = src.Id,
                            RevisionYear = 2018,
                            RiskLevel = src.RiskAssessment.RiskLevel,
                            EcologicalRiskLevel = src.RiskAssessment.EcoEffectLevel,
                            SpreadRiskLevel = src.RiskAssessment.InvationPotentialLevel,
                            MainCategory = src.AlienSpeciesCategory,
                            MainSubCategory = src.AlienSpeciesCategory == "DoorKnocker" ? src.DoorKnockerCategory :
                                src.AlienSpeciesCategory == "NotApplicable" ? src.NotApplicableCategory:
                                src.AlienSpeciesCategory == "RegionallyAlien" ? src.RegionallyAlienCategory:
                                ""
                        });
                        dest.PreviousAssessments.Add(new FA4.PreviousAssessment()
                        {
                            AssessmentId = src.VurderingId2012.ToString(),
                            RevisionYear = 2012,
                            RiskLevel = src.RiskLevel2012,
                            EcologicalRiskLevel = src.EcologicalRiskLevel2012,
                            SpreadRiskLevel = src.SpreadRiskLevel2012,
                            MainCategory = src.AlienSpeciesCategory2012,
                            MainSubCategory = ""
                        });

                        ConvertHelper.SetHorizonScanningBasedOn2018Assessments(dest);

                        // hentet fra det under - slik mapping fungerer ikke - da de blir kallt via convention - og det er ingen tilfeller der den har behov for å mappe fra FA3Legacy til Prod.Domain.RiskAssessment - koden blir ikke kallt
                        dest.RiskAssessment.AOOknownInput = src.CurrentExistenceArea;
                        dest.RiskAssessment.AOOtotalBestInput = src.CurrentExistenceAreaCalculated;
                        dest.RiskAssessment.AOOtotalLowInput = src.CurrentExistenceAreaLowCalculated;
                        dest.RiskAssessment.AOOtotalHighInput = src.CurrentExistenceAreaHighCalculated;
                        dest.RiskAssessment.AOO50yrBestInput = src.PotentialExistenceArea;
                        dest.RiskAssessment.AOO50yrLowInput = src.PotentialExistenceAreaLowQuartile;
                        dest.RiskAssessment.AOO50yrHighInput = src.PotentialExistenceAreaHighQuartile;

                        dest.RiskAssessment.AOOdarkfigureBest = ParseFloat(src.CurrentExistenceAreaMultiplier);
                        dest.RiskAssessment.AOOdarkfigureHigh = ParseFloat(src.CurrentExistenceAreaHighMultiplier);
                        dest.RiskAssessment.AOOdarkfigureLow = ParseFloat(src.CurrentExistenceAreaLowMultiplier);

                        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes = src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

                        if (!string.IsNullOrWhiteSpace(src.RegionalPresenceKnown))
                        {
                            var elements = src.RegionalPresenceKnown.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State0 = 1;
                                    match.State1 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        if (!string.IsNullOrWhiteSpace(src.RegionalPresenceAssumed))
                        {
                            var elements = src.RegionalPresenceAssumed.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State1 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        if (!string.IsNullOrWhiteSpace(src.RegionalPresencePotential))
                        {
                            var elements = src.RegionalPresencePotential.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State3 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        foreach (var item in dest.Fylkesforekomster)
                        {
                            if (item.State0 == 0 && item.State1 == 00 && item.State3 == 0)
                            {
                                item.State2 = 1;
                            }
                            else
                            {
                                item.State2 = 0;
                            }
                        }
                        //                    "RegionalPresenceKnown": "St",
                        //"RegionalPresenceAssumed": "",
                        //"RegionalPresencePotential": "Ro,Ho,Sf,Mr,St",


                        switch (src.AlienSpeciesCategory)
                        {
                            case "AlienSpecie":
                            case "DoorKnocker":
                            case "RegionallyAlien":
                            case "EcoEffectWithoutEstablishment":
                                dest.IsAlienSpecies = true;
                                break;
                            case "NotApplicable":
                                if (src.NotApplicableCategory != "notAlienSpecie")
                                {
                                    dest.IsAlienSpecies = true;
                                }

                                if (src.NotApplicableCategory == "taxonIsEvaluatedInHigherRank")
                                {
                                    dest.ConnectedToAnother = true;
                                }

                                if (src.NotApplicableCategory == "traditionalProductionSpecie")
                                {
                                    dest.ProductionSpecies = true;
                                }

                                if (src.NotApplicableCategory == "establishedBefore1800")
                                {
                                    dest.AlienSpecieUncertainIfEstablishedBefore1800 = true;
                                    dest.IsAlienSpecies = true;
                                    dest.ConnectedToAnother = false;
                                }

                                break;
                        }

                        if (src.AlienSpeciesCategory == "AlienSpecie" || src.AlienSpeciesCategory == "DoorKnocker")
                        {
                            dest.AlienSpecieUncertainIfEstablishedBefore1800 = false;
                        }

                        if (src.AlienSpeciesCategory == "RegionallyAlien")
                        {
                            dest.IsRegionallyAlien = true;
                        }

                        for (var i = 0; i < dest.RiskAssessment.SpeciesSpeciesInteractions.Count; i++)
                        {
                            if (dest.RiskAssessment.SpeciesSpeciesInteractions[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.SpeciesSpeciesInteractions[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.SpeciesSpeciesInteractions[i].Scale = "Large";
                            }
                        }

                        for (var i = 0; i < dest.RiskAssessment.SpeciesNaturetypeInteractions.Count; i++)
                        {
                            if (dest.RiskAssessment.SpeciesNaturetypeInteractions[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.SpeciesNaturetypeInteractions[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.SpeciesNaturetypeInteractions[i].Scale = "Large";
                            }
                        }

                        for (var i = 0; i < dest.RiskAssessment.HostParasiteInformations.Count; i++)
                        {
                            if (dest.RiskAssessment.HostParasiteInformations[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Scale = "Large";
                            }

                            if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteNewForHost && dest.RiskAssessment.HostParasiteInformations[i].ParasiteIsAlien)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "NewAlien";
                            }
                            else if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteIsAlien)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "KnownAlien";
                            }
                            else if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteNewForHost)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "NewNative";
                            }
                            else
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "KnownNative";
                            }
                        }

                        for (var i = 0; i < dest.RiskAssessment.GeneticTransferDocumented.Count; i++)
                        {
                            if (dest.RiskAssessment.GeneticTransferDocumented[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.GeneticTransferDocumented[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.GeneticTransferDocumented[i].Scale = "Large";
                            }
                        }

                        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes = dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.HasValue == false
                            ? 0
                            :
                            dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value > 95 ? 95
                                :
                                dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value > 75 ? 75
                                    :
                                    dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value >= 25 ? 25
                                        :
                                        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value >= 5 ? 5 : 0;

                        // issue #346
                        if (!string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time) || !string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time))
                        {
                            int riskAssessmentYearFirstIndoors = 0;
                            int riskAssessmentYearFirstIndoorsFertile = 0;
                            if (IsInt(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time)) riskAssessmentYearFirstIndoors = int.Parse(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time);
                            if (IsInt(src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time)) riskAssessmentYearFirstIndoorsFertile = int.Parse(src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time);
                            
                            dest.RiskAssessment.YearFirstIndoors =
                                riskAssessmentYearFirstIndoors > 0 && (riskAssessmentYearFirstIndoorsFertile == 0 ||
                                                                       riskAssessmentYearFirstIndoorsFertile >
                                                                       riskAssessmentYearFirstIndoors)
                                    ? riskAssessmentYearFirstIndoors
                                    : riskAssessmentYearFirstIndoorsFertile;
                        }

                        if (IsInt(src.ObservedAndEstablishedStatusInCountry.Indoor.Established.Time)) dest.RiskAssessment.YearFirstReproductionIndoors = int.Parse(src.ObservedAndEstablishedStatusInCountry.Indoor.Established.Time);

                        if (!string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time) || !string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.ProductionArea.FertileSpecimenObserved.Time))
                        {
                            int riskAssessmentYearFirstIndoors = 0;
                            int riskAssessmentYearFirstIndoorsFertile = 0;
                            if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time)) riskAssessmentYearFirstIndoors = int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time);
                            if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.FertileSpecimenObserved.Time)) riskAssessmentYearFirstIndoorsFertile = int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea.FertileSpecimenObserved.Time);

                            dest.RiskAssessment.YearFirstProductionOutdoors =
                                riskAssessmentYearFirstIndoors > 0 && (riskAssessmentYearFirstIndoorsFertile == 0 ||
                                                                       riskAssessmentYearFirstIndoorsFertile >
                                                                       riskAssessmentYearFirstIndoors)
                                    ? riskAssessmentYearFirstIndoors
                                    : riskAssessmentYearFirstIndoorsFertile;
                        }

                        if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Established.Time)) dest.RiskAssessment.YearFirstReproductionOutdoors = int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Established.Time);

                        if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Population.Time)) dest.RiskAssessment.YearFirstEstablishmentProductionArea = int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Population.Time);

                        if (!string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time) || !string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.FertileSpecimenObserved.Time))
                        {
                            int riskAssessmentYearFirstIndoors = 0;
                            int riskAssessmentYearFirstIndoorsFertile = 0;
                            if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time)) riskAssessmentYearFirstIndoors = int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time);
                            if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.FertileSpecimenObserved.Time)) riskAssessmentYearFirstIndoorsFertile = int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.FertileSpecimenObserved.Time);

                            dest.RiskAssessment.YearFirstNature =
                                riskAssessmentYearFirstIndoors > 0 && (riskAssessmentYearFirstIndoorsFertile == 0 ||
                                                                       riskAssessmentYearFirstIndoorsFertile >
                                                                       riskAssessmentYearFirstIndoors)
                                    ? riskAssessmentYearFirstIndoors
                                    : riskAssessmentYearFirstIndoorsFertile;
                        }

                        if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Established.Time)) dest.RiskAssessment.YearFirstReproductionNature = int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Established.Time);

                        if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Population.Time)) dest.RiskAssessment.YearFirstEstablishedNature = int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Population.Time);
                        var tekster = string.Join(" ",
                            new string[] {
                                src.FirstDomesticObservation,
                                GetNotInt("YearFirstIndoors",src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time),
                                GetNotInt("YearFirstIndoors",src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time),
                                GetNotInt("YearFirstReproductionIndoors",src.ObservedAndEstablishedStatusInCountry.Indoor.Established.Time),
                                GetNotInt("YearFirstProductionOutdoors",src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time),
                                GetNotInt("YearFirstProductionOutdoors",src.ObservedAndEstablishedStatusInCountry.ProductionArea.FertileSpecimenObserved.Time),
                                GetNotInt("YearFirstReproductionOutdoors",src.ObservedAndEstablishedStatusInCountry.ProductionArea.Established.Time),
                                GetNotInt("YearFirstEstablishmentProductionArea",src.ObservedAndEstablishedStatusInCountry.ProductionArea.Population.Time),
                                GetNotInt("YearFirstNature",src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time),
                                GetNotInt("YearFirstNature",src.ObservedAndEstablishedStatusInCountry.NorwegianNature.FertileSpecimenObserved.Time),
                                GetNotInt("YearFirstReproductionNature",src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Established.Time),
                                GetNotInt("YearFirstEstablishedNature",src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Population.Time)

                            }.Where(x => !string.IsNullOrWhiteSpace(x)).ToArray());

                        if (!string.IsNullOrWhiteSpace(tekster))
                            dest.RiskAssessment.YearFirstDomesticObservation = tekster;

                        if (src.VurderingsStatus == "SlettetAvAdmin" || src.VurderingsStatus == "SlettetFlyttetAvAdmin" || (src.ExpertGroupId == "ExpertGroups/Ikkemarineinvertebrater/N" && src.VurderingsStatus == null))
                        {
                            dest.IsDeleted = true;
                        }

                        var petAqua = dest.AssesmentVectors.Where(x=>x.CodeItem == "liveFoodLiveBait").ToArray();
                        if (petAqua.Length > 0)
                        {
                            foreach (var b in petAqua)
                            {
                                if (dest.ExpertGroup == "Fisker" || dest.ExpertGroup.StartsWith("Karplanter"))
                                {
                                    b.CodeItem = "liveAnimalFoodBait";
                                    b.Category = "av levende fôr eller agn (ikke til kjæledyr)";
                                }
                                else
                                {
                                    b.CodeItem = "liveHumanFood";
                                    b.Category = "av levende mat (til mennesker)";
                                }
                            }
                        }

                        // issue #388 og #392
                        var dict = Naturetypes;
                        var dictOld = Naturetypes2_2;
                        var impactedNatureTypes = dest.ImpactedNatureTypes.ToArray();
                        foreach (var item in impactedNatureTypes)
                        {
                            var code = item.NiNCode;
                            bool newCode = true;
                            if ((!code.StartsWith("LI ") && code.StartsWith("L")) || code.StartsWith("F"))
                            {
                                // nin 2_2 -> flyttes
                                newCode = false;
                                dest.ImpactedNatureTypes.Remove(item);
                                dest.ImpactedNatureTypesFrom2018.Add(item);
                            }

                            var text = newCode 
                                ? (dict.ContainsKey(code) ? dict[code] : string.Empty) 
                                : (dictOld.ContainsKey(code) ? dictOld[code] : string.Empty);
                            if (text == string.Empty)
                            {
                                continue;
                            }

                            if (string.IsNullOrWhiteSpace(item.Name))
                            {
                                item.Name = text;
                            }
                            else if (item.Name != text)
                            {
                                item.Name = text;
                            }

                            if (code.StartsWith("LI "))
                            {
                                // livsmedium
                                dest.ImpactedNatureTypes.Remove(item);
                                dest.Habitats.Add(new FA4.Habitat()
                                {
                                    NiNCode = item.NiNCode, Name = item.Name, TimeHorizon = item.TimeHorizon,
                                    StateChange = item.StateChange, AffectedArea = item.AffectedArea,
                                    ColonizedArea = item.ColonizedArea
                                });
                            }
                        }

                        var test = dest.RiskAssessment.Criteria.Where(x => x.CriteriaLetter == "F").Single();
                        if (test.UncertaintyValues.Length > 1)
                        {
                            test.UncertaintyValues = new[] { 0 };
                        }


                    });

                

                // - slik mapping fungerer ikke - da de blir kallt via convention - og det er ingen tilfeller der den har behov for å mappe fra FA3Legacy til Prod.Domain.RiskAssessment - koden blir ikke kallt
                //cfg.CreateMap<FA3Legacy, Prod.Domain.RiskAssessment>()
                //    .ForMember(dest => dest.AOOknown, opt => opt.MapFrom(src => src.CurrentExistenceArea))
                //    .ForMember(dest => dest.AOOtotalBest, opt => opt.MapFrom(src => src.CurrentExistenceAreaCalculated))
                //    .ForMember(dest => dest.AOOtotalLow,
                //        opt => opt.MapFrom(src => src.CurrentExistenceAreaLowCalculated))
                //    .ForMember(dest => dest.AOOtotalHigh,
                //        opt => opt.MapFrom(src => src.CurrentExistenceAreaHighCalculated))
                //    .ForMember(dest => dest.AOO50yrBest, opt => opt.MapFrom(src => src.PotentialExistenceArea))
                //    .ForMember(dest => dest.AOO50yrLow,
                //        opt => opt.MapFrom(src => src.PotentialExistenceAreaLowQuartile))
                //    .ForMember(dest => dest.AOO50yrHigh,
                //        opt => opt.MapFrom(src => src.PotentialExistenceAreaHighQuartile))
                //    .ForMember(dest => dest.AOOyear1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOendyear1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOyear2, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOendyear2, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOO1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOO2, opt => opt.Ignore())
                //    .ForMember(dest => dest.StartYear, opt => opt.Ignore())
                //    .ForMember(dest => dest.EndYear, opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes,
                //        opt => opt.MapFrom(src => src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes))
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest,
                //        opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow,
                //        opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh,
                //        opt => opt.Ignore())
                //    .ForAllOtherMembers(opt => opt.Ignore());



            });
            mapperConfig.AssertConfigurationIsValid();
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }

        private static List<Tuple<string, string>> DrillDown(JsonArray array, string id = "Id", string text = "Text", string child = "Children")
        {
            var result = new List<Tuple<string, string>>();
            foreach (var node in array)
            {
                result.Add(new Tuple<string, string>(node[id].GetValue<string>(), node[text].GetValue<string>()));
                result.AddRange(DrillDown(node[child].AsArray(), id, text, child));
            }

            return result;
        }
        private static JsonNode? ParseJson(string filen)
        {
            return JsonNode.Parse(File.Exists("../../../.." + filen) ? File.ReadAllText("../../../.." + filen) : File.ReadAllText(".." + filen));
        }

        private static bool IsInt(string src)
        {
            if (string.IsNullOrWhiteSpace(src))
            {
                return false;
            }
            int riskAssessmentYearFirstIndoors;
            return int.TryParse(src, out riskAssessmentYearFirstIndoors);
        }
        private static string GetNotInt(string label, string src)
        {
            if (string.IsNullOrWhiteSpace(src))
            {
                return null;
            }

            return IsInt(src) ? null : label + ":" + src;
        }

        private static long? ParseLong(string str)
        {
            if (long.TryParse(str, out long test))
            {
                return test;
            } 
            return null;
        }

        private static double? ParseDouble(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }
            var currencyDecimalSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.CurrencyDecimalSeparator;
            str = str.Replace(",", currencyDecimalSeparator).Replace(".", currencyDecimalSeparator);
            if (double.TryParse(str, out double test))
            {
                return test;
            } 

            switch (str)
            {
                case "> 100 år":
                    return 100;

                case "271 millioner år":
                    return 271000000;

                case "1-2 år":
                    return 1.5;
                    
                case "mer enn 1000 år":
                    return 1000;
                    
                case "40 år":
                    return 40;
                    
                case ">= 650 år":
                    return 650;

                case "60-649":
                    return 354.5;
                    
                case "mer enn én billion år":
                    return 1000000000000000000;

                case ">=650":
                    return 650;
                    
                case "1,5 år":
                    return 1.5;

                case ">1000 år":
                    return 1000;
                    
                case "=> 50 m/år":
                    return 50;

                case ">= 500 m/år":
                    return 500;
                
                default:
                    return null;
            }
        }

        private static float? ParseFloat(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }
            var currencyDecimalSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.CurrencyDecimalSeparator;
            str = str.Replace(",", currencyDecimalSeparator).Replace(".", currencyDecimalSeparator);
            if (float.TryParse(str, out float test))
            {
                return test;
            }

            return null;
        }

        private static long ParseLongFromNullableInt(int? spreadYearlyIncreaseObservations)
        {
            if (!spreadYearlyIncreaseObservations.HasValue)
            {
                return 0;
            }
            
            return (long)spreadYearlyIncreaseObservations.Value;
        }
    }
}