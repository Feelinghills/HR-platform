using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InterviewPlatform.Infrastructure.Documents;

public class InterviewProtocolDocument : IDocument
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
                    .Text("Протокол собеседования").FontFamily(PdfStyles.HeadingFont)
                    .SemiBold().FontSize(PdfStyles.SubheadingSize);

                // Protocol number and date (right)
                row.ConstantItem(200).AlignRight().Column(infoCol =>
                {
                    infoCol.Item().Text("Протокол № PS-86FCA5E1")
                        .FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.SecondaryColor);
                    infoCol.Item().Text("от 06.07.2026")
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
                .Text("Протокол\nсобеседования").FontFamily(PdfStyles.HeadingFont)
                .Bold().FontSize(PdfStyles.DocumentTitleSize).AlignCenter();
            column.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre).AlignCenter()
                .Text("О УУ - .NET Backend Developer").FontFamily(PdfStyles.HeadingFont)
                .FontSize(PdfStyles.SubheadingSize).FontColor(PdfStyles.SecondaryColor);

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Interview parameters section
            column.Item().Text("Параметры собеседования").FontFamily(PdfStyles.HeadingFont)
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

                table.Cell().Text("Дата и время:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("06.07.2026 21:45");

                table.Cell().Text("Интервьюер:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Пирожков Артур");

                table.Cell().Text("Статус:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Завершено");

                table.Cell().Text("Решение:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Отказать").FontColor(PdfStyles.RejectionColor);

                table.Cell().Text("Комментарии:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("-");
            });

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Competency matrix section
            column.Item().Text("Матрица компетенций").FontFamily(PdfStyles.HeadingFont)
                .SemiBold().FontSize(PdfStyles.SectionHeadingSize);
            column.Item().PaddingTop(4).LineHorizontal(PdfStyles.DividerThickness)
                .LineColor(PdfStyles.DividerColor);

            column.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.ConstantColumn(80);
                    columns.RelativeColumn(2);
                });

                // Table header
                table.Header(header =>
                {
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV)
                        .Text("Компетенция").FontFamily(PdfStyles.HeadingFont).Bold();
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV)
                        .Text("Оценка").FontFamily(PdfStyles.HeadingFont).Bold();
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV)
                        .Text("Комментарий").FontFamily(PdfStyles.HeadingFont).Bold();
                });

                // Competency rows
                AddCompetencyRow(table, "Backend / C# и .NET", "5 из 5", "");
                AddCompetencyRow(table, "Database / SQL и PostgreSQL", "5 из 5", "");
                AddCompetencyRow(table, "Soft Skills / Коммуникация", "5 из 5", "");
                AddCompetencyRow(table, "Technology / Computer Science", "5 из 5", "");
            });

            column.Item().PaddingTop(1.5f, Unit.Centimetre);

            // Interviewer signature
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(hrInfo =>
                {
                    hrInfo.Item().Text("Интервьюер:").FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.AccentColor);
                    hrInfo.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre)
                        .Text("Пирожков Артур").FontFamily(PdfStyles.HeadingFont).Bold();
                    hrInfo.Item().Text("HR-специалист").FontColor(PdfStyles.AccentColor);
                });

                row.ConstantItem(150).Column(sig =>
                {
                    sig.Item().Text("Дата собеседования:").FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.AccentColor);
                    sig.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre)
                        .LineHorizontal(PdfStyles.DividerThickness).LineColor(PdfStyles.PrimaryColor);
                });
            });
        });
    }

    private void AddCompetencyRow(TableDescriptor table, string competency, string score, string comment)
    {
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV).Text(competency);
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV).Text(score);
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV).Text(comment);
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
