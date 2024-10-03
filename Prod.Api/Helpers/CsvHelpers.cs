using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;
using Prod.Domain;

namespace Prod.Api.Helpers
{
    public class CsvHelpers
    {
        public class FremmedartToCsvMap : ClassMap<FA4WithComments>
        {

            private string ConvertToStringFunction(ConvertToStringArgs<FA4WithComments> args)
            {
                var ass = args.Value;
                var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
                if (ass2018 == null) return "NR2018";

                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "canNotEstablishWithin50years")
                    return "notEstablishedWithin50Years";
                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "traditionalProductionSpecie")
                    return "traditionalProductionSpecie";
                if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")
                    return "notAssessedDoorKnocker";
                return "assessed";
            }
            
        }

        internal class CustomStringListConverter : ITypeConverter
        {
            public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
            {
                var thing = (List<string>) value;
                if (thing == null || thing.Count == 0)
                {
                    return string.Empty;
                }

                return string.Join(", ", thing);
            }

            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                throw new NotImplementedException();
            }
        }

        internal class CustomStringArrayConverter : ITypeConverter
        {
            public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
            {
                var thing = (string[]) value;
                if (thing == null || thing.Length == 0)
                {
                    return string.Empty;
                }

                return string.Join(", ", thing);
            }

            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                throw new NotImplementedException();
            }
        }

        internal class CustomStringConverter : ITypeConverter
        {
            private const char Newline = '\n';

            public virtual string ConvertToString(
                object value,
                IWriterRow row,
                MemberMapData memberMapData)
            {
                if (value == null)
                    return string.Empty;
                if (!(value is IFormattable formattable))
                {
                    if (((string) value).Contains(Newline))
                    {
                        value = Regex.Replace(((string) value), "/(\\r\\n)+|\\r+|\\n+|\\t+/i", " ");
                    }

                    if (((string) value).Contains('<'))
                    {
                        value = Regex.Replace(((string) value), @"<.*?>", string.Empty);
                    }

                    if (((string) value).Contains("&nbsp;"))
                    {
                        value = ((string) value).Replace("&nbsp;", " ");
                    }

                    if (((string) value).Contains("&amp;"))
                    {
                        value = ((string) value).Replace("&amp;", "&");
                    }

                    return ((string) value).Contains("&")
                        ? WebUtility.HtmlDecode(value.ToString()).Trim()
                        : value.ToString().Trim();
                }

                string[] formats = memberMapData.TypeConverterOptions.Formats;
                string format = formats != null
                    ? ((IEnumerable<string>) formats).FirstOrDefault<string>()
                    : (string) null;
                return formattable.ToString(format,
                    (IFormatProvider) memberMapData.TypeConverterOptions.CultureInfo);
            }

            /// <summary>
            /// Converts the string to an object.
            /// </summary>
            /// <param name="text">The string to convert to an object.</param>
            /// <param name="row">The <see cref="IReaderRow"/> for the current record.</param>
            /// <param name="memberMapData">The <see cref="MemberMapData"/> for the member being created.</param>
            /// <returns>The object created from the string.</returns>
            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                if (text == null)
                    return (object) string.Empty;
                foreach (string nullValue in memberMapData.TypeConverterOptions.NullValues)
                {
                    if (text == nullValue)
                        return (object) null;
                }

                return (object) text;
            }
        }


        public class CustomDateTimeConverter : ITypeConverter
        {
            public string ConvertToString(object value, IWriterRow row, MemberMapData memberMapData)
            {
                if (value == null)
                {
                    return string.Empty;
                }

                var thing = (DateTime) value;

                return thing.ToString("yyyy.MM.dd");
            }

            public object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
            {
                throw new NotImplementedException();
            }
        }
    }
}
