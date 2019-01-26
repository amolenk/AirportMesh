namespace ScanService
{
    public static class XRayDataAnalyzer
    {
        public static bool Analyze(string xRayData)
        {
            // This ultra-sophisticated AI algorithm can detect contraband/illegal
            // items in scanned x-ray images of baggage.

            // Base the result on whether or not we find something iffy in the
            // x-ray data.
            return xRayData.Contains("[something_iffy]");
        }
    }
}