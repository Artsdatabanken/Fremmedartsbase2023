using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;

namespace Nbic.Indexer
{
    public class Index : IDisposable
    {
        private const string Field_Id = "Id";

        private static readonly object _theLock = new();
        private readonly FSDirectory _dir;
        private readonly bool _lockWasTaken;

        private HashSet<string> _stopwords = new()
        {
            "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not",
            "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was",
            "will", "with"
        }; // StopAnalyzer.ENGLISH_STOP_WORDS_SET.ToArray().ToHashSet();

        //private const string Field_String = "Reference";
        private readonly IndexWriter _writer;

        public Index(bool waitForLockFile = false, bool deleteAndCreateIndex = false)
        {
            // Ensures index backwards compatibility
            var AppLuceneVersion = LuceneVersion.LUCENE_48;

            var applicationRoot = GetApplicationRoot();
            if (string.IsNullOrWhiteSpace(applicationRoot)) applicationRoot = AppDomain.CurrentDomain.BaseDirectory;
            var indexLocation = applicationRoot.Contains('\\')
                ? $@"{applicationRoot}\Data\index"
                : $@"{applicationRoot}/Data/index";
            if (waitForLockFile)
            {
                var lockfileindexLocation = applicationRoot.Contains('\\')
                    ? $@"{applicationRoot}\Data\index\write.lock"
                    : $@"{applicationRoot}/Data/index/write.lock";
                //var otherdir = AppDomain.CurrentDomain.BaseDirectory;
                var retry = 50;
                while (retry > 0 && File.Exists(lockfileindexLocation))
                {
                    Task.Delay(100).Wait();
                    //Thread.Sleep(100);
                    retry--;
                }

                Monitor.Enter(_theLock);
                _lockWasTaken = true;
            }


            _dir = FSDirectory.Open(indexLocation);

            //create an analyzer to process the text
            var analyzer = new StandardAnalyzer(AppLuceneVersion);
            //_idAnalyser = new SimpleAnalyzer(AppLuceneVersion);

            //create an index writer
            var indexConfig = new IndexWriterConfig(AppLuceneVersion, analyzer);
            if (deleteAndCreateIndex) indexConfig.OpenMode = OpenMode.CREATE;
            _writer = new IndexWriter(_dir, indexConfig);
        }

        public bool FirstUse { get; set; } = true;

        public void Dispose()
        {
            if (_writer != null)
            {
                _writer.Flush(true, true);
                _writer.WaitForMerges();
                _writer.Commit();

                _writer.Dispose();
            }

            if (_dir != null) _dir.Dispose();

            if (_lockWasTaken) Monitor.Exit(_theLock);
        }

        public void AddOrUpdate(Document doc)
        {
            _writer.UpdateDocument(new Term(Field_Id, doc.Get(Field_Id)), doc);
            _writer.Commit();
        }


        public void AddOrUpdate(IEnumerable<Document> refs)
        {
            foreach (var doc in refs) _writer.UpdateDocument(new Term(Field_Id, doc.Get(Field_Id)), doc);

            _writer.Commit();
        }

        public IEnumerable<Document> SearchReference(Query query, int offset, int limit, string sortField = "")
        {
            var searcher = new IndexSearcher(_writer.GetReader(true));
            var startAt = offset * limit;
            var sort = sortField != "" ? new Sort(new SortField(sortField, SortFieldType.STRING)) : Sort.INDEXORDER;
            var hits = searcher.Search(query, startAt + limit /* top 20 */, sort).ScoreDocs;
            var count = 0;
            var found = new HashSet<Guid>();
            foreach (var hit in hits)
            {
                count++;
                if (count <= startAt) continue;
                var foundDoc = searcher.Doc(hit.Doc);
                //var guid = Guid.Parse(foundDoc.Get(Field_Id));
                //found.Add(guid);
                yield return foundDoc;
            }
        }

        public int SearchTotalCount(Query query)
        {
            var searcher = new IndexSearcher(_writer.GetReader(true));
            var collector = new TotalHitCountCollector();
            searcher.Search(query, collector);
            return collector.TotalHits;
        }

        public void Delete(Guid newGuid)
        {
            _writer.DeleteDocuments(new Term(Field_Id, newGuid.ToString()));
            //_writer.Flush(triggerMerge: true, applyAllDeletes: true);
            _writer.Commit();
        }

        public int IndexCount()
        {
            return _writer.MaxDoc;
        }

        public void ClearIndex()
        {
            _writer.DeleteAll();
            //_writer.Flush(true,true);
            _writer.Commit();
        }

        public string GetApplicationRoot()
        {
            var exePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var appPathMatcher = new Regex(@"(?<!fil)[A-Za-z]:\\+[\S\s]*?(?=\\+bin)");
            var appRoot = appPathMatcher.Match(exePath ?? throw new InvalidOperationException("Could not get path of executing assembly")).Value;
            return appRoot;
        }

        public IndexVersion GetIndexVersion()
        {
            var searcher = new IndexSearcher(_writer.GetReader(true));

            //find your document location
            //var analyzer = new StandardAnalyzer(Lucene.Net.Util.Version.LUCENE_30);
            var query = new TermQuery(new Term(Field_Id, "IndexVersion"));
            var result = searcher.Search(query, 1).ScoreDocs.FirstOrDefault();

            if (result == null)
            {
                return new IndexVersion() { DateTime = DateTime.MinValue, Version = 0 };
            }
            //Fetch a document by index number. This index number is stored as an integer in result.Doc
            Document d = searcher.Doc(result.Doc);
            //return

            return new IndexVersion()
            {
                Version = Convert.ToInt32(d.GetField("Version").GetStringValue()),
                DateTime = DateTime.Parse(d.GetField("Date").GetStringValue(), CultureInfo.InvariantCulture)
            };
        }
        /// <summary>
        /// Method to store something i local index that can say something about version and date of index
        /// </summary>
        public void SetIndexVersion(IndexVersion version)
        {
            var doc = new Document()
            {
                new StringField(Field_Id, "IndexVersion", Field.Store.NO),
                new StringField("Version", version.Version.ToString(), Field.Store.YES ),
                new StringField("Date", version.DateTime.ToString(CultureInfo.InvariantCulture), Field.Store.YES )
            };

            _writer.UpdateDocument(new Term(Field_Id, doc.Get(Field_Id)), doc);
            _writer.Commit();
        }
    }

    public class IndexVersion   
    {
        public int Version { get; set; }
        public DateTime DateTime { get; set; }
    }
}