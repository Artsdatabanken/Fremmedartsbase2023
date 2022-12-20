using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SwissKnife.Database;

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