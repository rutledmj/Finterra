namespace SymbolSearch.Models
{
    public class Class
    {
        public int Id { get; set; }
        public string Symbol { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Exchange { get; set; }
        public string CurrencyCode { get; set; }
        public string LogoId { get; set; }
        public string ProviderId { get; set; }
        public Source Source { get; set; }

        public string SourceId { get; set; }

        public string Country { get; set; }
        public bool IsPrimaryListing { get; set; }

    }

    public class Source
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
