using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InterviewPlatform.Infrastructure.Documents;

public class RejectionLetterDocument : IDocument
{
    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.MarginLeft(PdfStyles.MarginLeft);
            page.MarginRight(PdfStyles.MarginRight);
            page.MarginTop(PdfStyles.MarginTop);
            page.MarginBottom(PdfStyles.MarginBottom);
            page.PageColor(Colors.White);
            
            page.DefaultTextStyle(x => x.FontFamily(PdfStyles.BodyFont).FontSize(PdfStyles.BodySize).LineHeight(1.5f));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().Element(ComposeFooter);
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                // Logo
                row.RelativeItem().Column(logoCol =>
                {
                    logoCol.Item().Width(PdfStyles.HeaderLogoWidth).Image("assets/LogoBlack.png");
                });

                // Document title (centered)
                row.RelativeItem().AlignCenter().AlignMiddle()
                    .Text("Решение по кандидату").FontFamily(PdfStyles.HeadingFont)
                    .SemiBold().FontSize(PdfStyles.SubheadingSize);

                // Document number and date (right)
                row.ConstantItem(200).AlignRight().Column(infoCol =>
                {
                    infoCol.Item().Text("Исх. № Исx-86FCA5E1")
                        .FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.SecondaryColor);
                    infoCol.Item().Text("от 07.07.2026 г.")
                        .FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.SecondaryColor);
                });
            });
            
            // Decorative double-line divider
            column.Item().PaddingTop(6).LineHorizontal(PdfStyles.DividerThickness)
                .LineColor(PdfStyles.DividerColor);
            column.Item().PaddingTop(PdfStyles.DoubleLineGap)
                .LineHorizontal(PdfStyles.DividerThickness).LineColor(PdfStyles.DividerColor);
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre).Column(column =>
        {
            // Document title
            column.Item().AlignCenter()
                .Text("ОТКАЗ КАНДИДАТУ").FontFamily(PdfStyles.HeadingFont)
                .Bold().FontSize(PdfStyles.DocumentTitleSize);
            
            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Decision info section
            column.Item().Text("Информация о решении").FontFamily(PdfStyles.HeadingFont)
                .SemiBold().FontSize(PdfStyles.SectionHeadingSize);
            column.Item().PaddingTop(4).LineHorizontal(PdfStyles.DividerThickness)
                .LineColor(PdfStyles.DividerColor);
            
            column.Item().PaddingVertical(PdfStyles.ContentPadding, Unit.Centimetre).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(140);
                    columns.RelativeColumn();
                });

                table.Cell().Text("Кандидат:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("ОУУ");

                table.Cell().Text("Вакансия:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text(".NET Backend Developer");

                table.Cell().Text("Дата решения:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("07.07.2026");
            });

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Greeting and rejection text
            column.Item().Text("Уважаемый У У!").FontFamily(PdfStyles.HeadingFont).Bold();
            column.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre)
                .Text("Спасибо за интерес к вакансии \".NET Backend Developer\". На текущем этапе мы не готовы продолжить процесс.");
            
            column.Item().PaddingTop(2.5f, Unit.Centimetre);

            // HR signature
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(hrInfo =>
                {
                    hrInfo.Item().Text("Пирожков Артур").FontFamily(PdfStyles.HeadingFont).Bold();
                    hrInfo.Item().Text("HR-специалист").FontColor(PdfStyles.AccentColor);
                });
                
                row.ConstantItem(150).Column(sig =>
                {
                    sig.Item().PaddingTop(1.5f, Unit.Centimetre)
                        .LineHorizontal(PdfStyles.DividerThickness).LineColor(PdfStyles.PrimaryColor);
                    sig.Item().PaddingTop(4).AlignCenter()
                        .Text("(дата/подпись)").FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.AccentColor);
                });
            });
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().LineHorizontal(PdfStyles.DividerThickness).LineColor(PdfStyles.DividerColor);
            column.Item().PaddingTop(8).AlignCenter().Text(text =>
            {
                text.Span("Страница ").FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize);
                text.CurrentPageNumber().FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize);
                text.Span(" из ").FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize);
                text.TotalPages().FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize);
            });
        });
    }
}
