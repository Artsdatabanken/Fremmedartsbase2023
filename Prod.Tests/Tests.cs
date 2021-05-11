using NUnit.Framework;

namespace Prod.Tests
{
    public class MapperTests
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void MapOldFormatToNewIsOk()
        {
            SwissKnife.Database.Maintenance.CreateMappingFromOldToNew();
            Assert.Pass();
        }
    }
}