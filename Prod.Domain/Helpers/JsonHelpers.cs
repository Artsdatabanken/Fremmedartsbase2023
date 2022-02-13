using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Prod.Domain.Helpers
{
    public class JsonHelpers
    {
        /// <summary>
        /// because of bad handling of int in some javascript code - need to convert string empty to int = 0 and back as string
        /// </summary>
        public class CrazyIntJsonConverter : JsonConverter<int>
        {
            public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                if (reader.TokenType == JsonTokenType.Null)
                {
                    return 0;
                }
                if (reader.TokenType == JsonTokenType.Number)
                {
                    return reader.GetInt32();
                }

                var value = reader.GetString();
                return string.IsNullOrWhiteSpace(value) ? 0 : int.Parse(value);
            }

            public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
            {
                writer.WriteStringValue(value == 0 ? "" : value.ToString());
            }
        }


        public class BoolJsonConverter : JsonConverter<bool>
        {
            public override bool Read(
                ref Utf8JsonReader reader,
                Type typeToConvert,
                JsonSerializerOptions options)
            {
                if (reader.TokenType == JsonTokenType.False)
                {
                    return false;
                }

                if (reader.TokenType == JsonTokenType.True)
                {
                    return true;
                }

                if (reader.TokenType == JsonTokenType.Null)
                {
                    return false;
                }

                var value = reader.GetString();
                return value != null && (value.ToLowerInvariant() == "true");
            }

            public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options)
            {
                writer.WriteBooleanValue(value);
            }
        }

        public class BoolNullableJsonConverter : JsonConverter<bool?>
        {
            public override bool? Read(
                ref Utf8JsonReader reader,
                Type typeToConvert,
                JsonSerializerOptions options)
            {
                if (reader.TokenType == JsonTokenType.False)
                {
                    return false;
                }

                if (reader.TokenType == JsonTokenType.True)
                {
                    return true;
                }

                if (reader.TokenType == JsonTokenType.Null)
                {
                    return null;
                }

                var value = reader.GetString();
                return value != null && (value.ToLowerInvariant() == "true");
            }

            public override void Write(Utf8JsonWriter writer, bool? value, JsonSerializerOptions options)
            {
                if (value.HasValue)
                {
                    writer.WriteBooleanValue(value.Value);
                }
                else
                {
                    writer.WriteNullValue();

                }
            }
        }


        public class DoubleJsonConverter : System.Text.Json.Serialization.JsonConverter<double?>
        {
            public override bool CanConvert(Type objectType)
            {
                return objectType == typeof(double) || objectType == typeof(double?);
            }

            public override double? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                switch (reader.TokenType)
                {
                    case JsonTokenType.Number:
                        return reader.GetDouble();
                    case JsonTokenType.String:
                        {
                            double temp;
                            var attempted = reader.GetString().Replace(",", ".");
                            if (double.TryParse(
                                attempted,
                                NumberStyles.Number,
                                CultureInfo.InvariantCulture,
                                out temp)
                            )
                            {
                                return temp;
                            }

                            break;
                        }
                }

                return null;
            }

            public override void Write(Utf8JsonWriter writer, double? value, JsonSerializerOptions options)
            {
                if (value.HasValue)
                {
                    writer.WriteNumberValue(value.Value);
                }
                else
                {
                    writer.WriteNullValue();
                }

            }
        }
    }
}
