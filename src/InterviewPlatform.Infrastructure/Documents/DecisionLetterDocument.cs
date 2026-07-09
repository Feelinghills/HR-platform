using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InterviewPlatform.Infrastructure.Documents;

public class DecisionLetterDocument : IDocument
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
                    infoCol.Item().Text("Исх. № Исх-D3906180")
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
                .Text("ОФФЕР КАНДИДАТУ").FontFamily(PdfStyles.HeadingFont)
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
                table.Cell().Text("Ананасов Артем Антонович");

                table.Cell().Text("Вакансия:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("Системный администратор");

                table.Cell().Text("Дата решения:").FontFamily(PdfStyles.HeadingFont).Bold();
                table.Cell().Text("07.07.2026");
            });

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Greeting
            column.Item().Text("Уважаемый Артем Антонович!").FontFamily(PdfStyles.HeadingFont).Bold();
            column.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre)
                .Text("Поздравляем! Команда готова сделать предложение по вакансии \"Системный администратор\".");
            
            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Main conditions
            column.Item().Text("Основные условия").FontFamily(PdfStyles.HeadingFont)
                .SemiBold().FontSize(PdfStyles.SectionHeadingSize);
            column.Item().PaddingTop(4).LineHorizontal(PdfStyles.DividerThickness)
                .LineColor(PdfStyles.DividerColor);
            
            column.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre).Column(list =>
            {
                list.Item().Text("• Испытательный срок определяется в соответствии с трудовым законодательством.");
                list.Item().Text("• Рабочий график и формат работы согласовываются с непосредственным руководителем.");
                list.Item().Text("• Оплата труда и социальный пакет обсуждаются на этапе подписания трудового договора.");
            });

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);

            // Employment requirements
            column.Item().Text("Для завершения процедуры трудоустройства потребуется:").FontFamily(PdfStyles.HeadingFont)
                .SemiBold().FontSize(PdfStyles.SectionHeadingSize);
            column.Item().PaddingTop(4).LineHorizontal(PdfStyles.DividerThickness)
                .LineColor(PdfStyles.DividerColor);
            
            column.Item().PaddingTop(PdfStyles.ContentPadding, Unit.Centimetre).Column(list =>
            {
                list.Item().Text("• предоставить документы, необходимые для оформления трудового договора;");
                list.Item().Text("• пройти медицинский осмотр (при необходимости);");
                list.Item().Text("• подписать трудовой договор в отделе кадров.");
            });

            column.Item().PaddingTop(PdfStyles.SectionSpacing, Unit.Centimetre);
            column.Item().Text("С нетерпением ждём Вас в нашей команде!").Italic();

            column.Item().PaddingTop(1.5f, Unit.Centimetre);

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