using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InterviewPlatform.Infrastructure.Documents;

public class CandidateCardDocument : IDocument
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
                    .Text("Карточка кандидата").FontFamily(PdfStyles.HeadingFont)
                    .SemiBold().FontSize(PdfStyles.SubheadingSize);

                // Card number and date (right)
                row.ConstantItem(200).AlignRight().Column(infoCol =>
                {
                    infoCol.Item().Text("№ KK-6265BB84")
                        .FontFamily(PdfStyles.HeadingFont).FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.SecondaryColor);
                    infoCol.Item().Text("от 07.07.2026")
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
            // Candidate name
            column.Item().AlignCenter()
                .Text("ОУУ").FontFamily(PdfStyles.HeadingFont)
                .Bold().FontSize(18f);
            
            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Contact information section
            column.Item().Text("Контактная информация").FontFamily(PdfStyles.HeadingFont)
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

                table.Cell().Text("Телефон:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("+7 (000) 999-99-99");

                table.Cell().Text("Email:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("ouu@mail.ru");

                table.Cell().Text("Город:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Каир");

                table.Cell().Text("Желаемая позиция:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Сеньёр");
            });

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Education and work experience section
            column.Item().Text("Образование и опыт работы").FontFamily(PdfStyles.HeadingFont)
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

                table.Cell().Text("Навыки:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Знание нескольких фреймворков и языков программирования");

                table.Cell().Text("Образование:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Высшее");

                table.Cell().Text("Предыдущее место работы:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("ІТ-компания Египта");
            });

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Interview history section
            column.Item().Text("История собеседований").FontFamily(PdfStyles.HeadingFont)
                .SemiBold().FontSize(PdfStyles.SectionHeadingSize);
            column.Item().PaddingTop(4).LineHorizontal(PdfStyles.DividerThickness)
                .LineColor(PdfStyles.DividerColor);
            
            column.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(110);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1.5f);
                    columns.ConstantColumn(80);
                });

                // Table header
                table.Header(header =>
                {
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV)
                        .Text("Дата").FontFamily(PdfStyles.HeadingFont).Bold().FontSize(PdfStyles.SmallSize);
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV)
                        .Text("Вакансия").FontFamily(PdfStyles.HeadingFont).Bold().FontSize(PdfStyles.SmallSize);
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV)
                        .Text("Решение").FontFamily(PdfStyles.HeadingFont).Bold().FontSize(PdfStyles.SmallSize);
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV)
                        .Text("Статус").FontFamily(PdfStyles.HeadingFont).Bold().FontSize(PdfStyles.SmallSize);
                });

                // History rows
                AddHistoryRow(table, "06.07.2026 21:45", ".NET Backend Developer", "Отказать", "Завершено", isRejection: true);
                AddHistoryRow(table, "06.07.2026 21:12", ".NET Backend Developer", "Ожидает решения", "Отменено");
                AddHistoryRow(table, "06.07.2026 17:02", "Системный администратор", "Ожидает решения", "Отменено");
                AddHistoryRow(table, "06.07.2026 16:52", ".NET Backend Developer", "Ожидает решения", "Отменено");
            });

            column.Item().PaddingTop(1.5f, Unit.Centimetre);

            // Manager signature block
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(sig =>
                {
                    sig.Item().Text("Подпись руководителя:").FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.AccentColor);
                    sig.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre)
                        .LineHorizontal(PdfStyles.DividerThickness).LineColor(PdfStyles.PrimaryColor);
                });
                
                row.ConstantItem(50);
                
                row.ConstantItem(150).Column(date =>
                {
                    date.Item().Text("Дата:").FontSize(PdfStyles.SmallSize)
                        .FontColor(PdfStyles.AccentColor);
                    date.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre)
                        .LineHorizontal(PdfStyles.DividerThickness).LineColor(PdfStyles.PrimaryColor);
                });
            });
        });
    }

    private void AddHistoryRow(TableDescriptor table, string date, string vacancy, string decision, string status, bool isRejection = false)
    {
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV).Text(date).FontSize(PdfStyles.SmallSize);
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV).Text(vacancy).FontSize(PdfStyles.SmallSize);
        
        var decisionCell = table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV).Text(decision).FontSize(PdfStyles.SmallSize);
        if (isRejection) 
            decisionCell.FontColor(PdfStyles.RejectionColor);

        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .PaddingHorizontal(PdfStyles.CellPaddingH).PaddingVertical(PdfStyles.CellPaddingV).Text(status).FontSize(PdfStyles.SmallSize);
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
