using QuestPDF.Helpers;

namespace InterviewPlatform.Infrastructure;

/// <summary>
/// Shared style constants for elegant formal PDF documents.
/// </summary>
public static class PdfStyles
{
    // Font families
    public const string HeadingFont = "Times New Roman";
    public const string BodyFont = "Times New Roman";

    // Font sizes
    public const float DocumentTitleSize = 18f;
    public const float SectionHeadingSize = 14f;
    public const float SubheadingSize = 12f;
    public const float BodySize = 11f;
    public const float SmallSize = 10f;
    public const float LabelSize = 11f;

    // Colors
    public static readonly string PrimaryColor = Colors.Black;
    public static readonly string SecondaryColor = Colors.Grey.Darken2;
    public static readonly string AccentColor = Colors.Grey.Darken1;
    public static readonly string TableHeaderBg = Colors.Grey.Lighten4;
    public static readonly string DividerColor = Colors.Grey.Medium;
    public static readonly string RejectionColor = Colors.Red.Medium;

    // Spacing
    public const float HeaderLogoWidth = 120f;
    public const float SectionSpacing = 0.8f; // cm
    public const float ContentPadding = 0.4f; // cm
    public const float CellPaddingH = 8f; // px
    public const float CellPaddingV = 6f; // px

    // Margins (in points, 1cm = 28.35pt)
    public const float MarginLeft = 70f;   // 2.5cm
    public const float MarginRight = 70f;  // 2.5cm
    public const float MarginTop = 56f;    // 2cm
    public const float MarginBottom = 56f; // 2cm

    // Decorative elements
    public const float DividerThickness = 0.5f;
    public const float DoubleLineGap = 2f;
}
