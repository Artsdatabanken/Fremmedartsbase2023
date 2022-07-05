using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Prod.Infrastructure.Services;

namespace Prod.Api.Services
{
    public interface IReferenceService {
        Task<Reference> Store(Reference value);
        Task<Reference> Get(Guid referenceReferenceId);
        Task<bool> SignalUsage(Guid[] usedReferences, Guid userId);
        Task<bool> Delete(Guid id);
        Task<Reference> Update(Reference reference);
    }   
}