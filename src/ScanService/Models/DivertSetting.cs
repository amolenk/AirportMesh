namespace ScanService.Models
{
    public enum DivertSetting
    {
        // Don't divert at all.
        None = 0,

        // Can divert only carry-on size luggage.
        LittleNudge = 1,

        // Enough force to divert all regular luggage.
        StrongPush = 2,

        // Only use for larger, special-type luggage.
        ThorsHammer = 3
    }
}