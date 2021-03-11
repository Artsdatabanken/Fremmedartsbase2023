using Microsoft.EntityFrameworkCore;

namespace Prod.Data.EFCore
{
    public class SqlServerProdDbContext : ProdDbContext
    {
        private readonly string _dbConnectionString;
        public SqlServerProdDbContext()
        {

        }
        public SqlServerProdDbContext(string dbConnectionString)
        {
            _dbConnectionString = dbConnectionString;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlServer(_dbConnectionString);
    }
}