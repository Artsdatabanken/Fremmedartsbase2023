﻿using System;

namespace Prod.Api.Models
{
    /// <summary>
    /// Filter to query assessments by. Used by Frontend via APi
    /// </summary>
    public class IndexFilter
    {
        public IndexFilter()
        {
            History = new History();
            Current = new Current();
            Progress = new Progress();
            Horizon = new Horizon();
            Comments = new Comments();
        }

        public int Page { get; set; } = 0;
        public int PageSize { get; set; } = 500;

        /// <summary>
        /// Authors by full name
        /// </summary>
        public string[] Responsible { get; set; } = Array.Empty<string>();

        /// <summary>
        /// Full substring search in names
        /// </summary>
        public string NameSearch { get; set; } = string.Empty;

        public History History { get; set; }
        public Current Current { get; set; }
        public Progress Progress { get; set; }

        /// <summary>
        /// Filters related to horizonScanning
        /// </summary>
        public Horizon Horizon { get; set; }
        public Comments Comments { get; set; }
        /// <summary>
        /// If mode is HorizonScan or full assessment 
        /// </summary>
        public bool HorizonScan { get; set; }

        public bool HSStatus { get; set; }

        public string[] Status { get; set; } = Array.Empty<string>();
    }

    public class Progress
    {
    }

    /// <summary>
    /// Filter on current assessments
    /// </summary>
    public class Current
    {
        public string[] Category { get; set; } = Array.Empty<string>();
        public string[] Criteria { get; set; } = Array.Empty<string>();
        public string[] Status { get; set; } = Array.Empty<string>();
    }

    /// <summary>
    /// Previous assessment filter properties
    /// </summary>
    public class History
    {
        public string[] Category { get; set; } = Array.Empty<string>();
        public string[] Criteria { get; set; } = Array.Empty<string>();
        public string[] Status { get; set; } = Array.Empty<string>();
    }

    /// <summary>
    /// horizon scanning filter properties
    /// </summary>
    public class Horizon
    {
        public string[] NR2018 { get; set; } = Array.Empty<string>();
        public bool NotStarted { get; set; } = false;
        public bool Finished { get; set; }
        public bool ToAssessment { get; set; }
        public bool NotAssessed { get; set; }
    }

    public class Comments
    {
        public bool KunUbehandlede { get; set; }
        /// <summary>
        /// brukerid til den som man leter etter nye kommentarer for....
        /// </summary>
        public Guid UserId { get; set; }
        public string[] CommentType { get; set; } = Array.Empty<string>();
    }
}