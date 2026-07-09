# Elegant Formal PDF Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform all 4 QuestPDF documents from basic functional layout to elegant formal style with classic serif typography, decorative borders, and refined visual hierarchy.

**Architecture:** Create a shared `PdfStyles` class containing all style constants (fonts, colors, spacing, decorative elements) to ensure consistency across all documents. Update each document class to use these shared styles. Maintain the existing `QuestPdfService` generic approach while applying the new styling.

**Tech Stack:** QuestPDF, C# (.NET), Times New Roman font family

## Global Constraints

- QuestPDF Community License (already configured in `Infrastructure.cs:306`)
- Font: Times New Roman (serif) for formal elegance
- Logo path: `assets/LogoBlack.png` (embedded resource in Infrastructure assembly)
- All documents must support Cyrillic text (Arial fallback for body, Times New Roman for headings)
- Maintain existing document data structures (ReportDocument, sections, tables)

---

## File Structure

```
src/InterviewPlatform.Infrastructure/
├── PdfStyles.cs                    (NEW) - Shared style constants
├── Infrastructure.cs               (MODIFY) - Update QuestPdfService
└── Documents/
    ├── DecisionLetterDocument.cs   (MODIFY) - Offer letter
    ├── RejectionLetterDocument.cs  (MODIFY) - Rejection letter
    ├── InterviewProtocolDocument.cs (MODIFY) - Interview protocol
    └── CandidateCardDocument.cs    (MODIFY) - Candidate card
```

---

### Task 1: Create PdfStyles shared constants class

**Covers:** [S1, S2, S3, S4, S5, S6]

**Files:**
- Create: `src/InterviewPlatform.Infrastructure/PdfStyles.cs`

**Interfaces:**
- Consumes: QuestPDF.Helpers (Colors, PageSizes)
- Produces: PdfStyles static class with all style constants

- [ ] **Step 1: Create PdfStyles.cs with style constants**

```csharp
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
```

- [ ] **Step 2: Verify compilation**

Run: `dotnet build src/InterviewPlatform.Infrastructure/`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add src/InterviewPlatform.Infrastructure/PdfStyles.cs
git commit -m "feat(pdf): add shared PdfStyles constants for elegant formal style"
```

---

### Task 2: Update DecisionLetterDocument with elegant style

**Covers:** [S1, S2, S3, S5, S6]

**Files:**
- Modify: `src/InterviewPlatform.Infrastructure/Documents/DecisionLetterDocument.cs`

**Interfaces:**
- Consumes: PdfStyles (all constants)
- Produces: Updated DecisionLetterDocument class

- [ ] **Step 1: Update DecisionLetterDocument using PdfStyles**

```csharp
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
                    columns.RelativeItem();
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
```

- [ ] **Step 2: Verify compilation**

Run: `dotnet build src/InterviewPlatform.Infrastructure/`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add src/InterviewPlatform.Infrastructure/Documents/DecisionLetterDocument.cs
git commit -m "feat(pdf): apply elegant formal style to DecisionLetterDocument"
```

---

### Task 3: Update RejectionLetterDocument with elegant style

**Covers:** [S1, S2, S3, S5, S6]

**Files:**
- Modify: `src/InterviewPlatform.Infrastructure/Documents/RejectionLetterDocument.cs`

**Interfaces:**
- Consumes: PdfStyles (all constants)
- Produces: Updated RejectionLetterDocument class

- [ ] **Step 1: Update RejectionLetterDocument using PdfStyles**

```csharp
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
                    columns.RelativeItem();
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
```

- [ ] **Step 2: Verify compilation**

Run: `dotnet build src/InterviewPlatform.Infrastructure/`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add src/InterviewPlatform.Infrastructure/Documents/RejectionLetterDocument.cs
git commit -m "feat(pdf): apply elegant formal style to RejectionLetterDocument"
```

---

### Task 4: Update InterviewProtocolDocument with elegant style

**Covers:** [S1, S2, S3, S4, S5, S6]

**Files:**
- Modify: `src/InterviewPlatform.Infrastructure/Documents/InterviewProtocolDocument.cs`

**Interfaces:**
- Consumes: PdfStyles (all constants)
- Produces: Updated InterviewProtocolDocument class

- [ ] **Step 1: Update InterviewProtocolDocument using PdfStyles**

```csharp
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
                    columns.RelativeItem();
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
                    columns.RelativeItem(2);
                    columns.ConstantColumn(80);
                    columns.RelativeItem(2);
                });

                // Table header
                table.Header(header =>
                {
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV)
                        .Text("Компетенция").FontFamily(PdfStyles.HeadingFont).Bold();
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV)
                        .Text("Оценка").FontFamily(PdfStyles.HeadingFont).Bold();
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV)
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
            .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV).Text(competency);
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV).Text(score);
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV).Text(comment);
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
```

- [ ] **Step 2: Verify compilation**

Run: `dotnet build src/InterviewPlatform.Infrastructure/`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add src/InterviewPlatform.Infrastructure/Documents/InterviewProtocolDocument.cs
git commit -m "feat(pdf): apply elegant formal style to InterviewProtocolDocument"
```

---

### Task 5: Update CandidateCardDocument with elegant style

**Covers:** [S1, S2, S3, S4, S5, S6]

**Files:**
- Modify: `src/InterviewPlatform.Infrastructure/Documents/CandidateCardDocument.cs`

**Interfaces:**
- Consumes: PdfStyles (all constants)
- Produces: Updated CandidateCardDocument class

- [ ] **Step 1: Update CandidateCardDocument using PdfStyles**

```csharp
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
                    columns.RelativeItem();
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
                    columns.RelativeItem();
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
                    columns.RelativeItem(2);
                    columns.RelativeItem(1.5f);
                    columns.ConstantColumn(80);
                });

                // Table header
                table.Header(header =>
                {
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV)
                        .Text("Дата").FontFamily(PdfStyles.HeadingFont).Bold().FontSize(PdfStyles.SmallSize);
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV)
                        .Text("Вакансия").FontFamily(PdfStyles.HeadingFont).Bold().FontSize(PdfStyles.SmallSize);
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV)
                        .Text("Решение").FontFamily(PdfStyles.HeadingFont).Bold().FontSize(PdfStyles.SmallSize);
                    header.Cell().Background(PdfStyles.TableHeaderBg)
                        .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV)
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
            .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV).Text(date).FontSize(PdfStyles.SmallSize);
        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV).Text(vacancy).FontSize(PdfStyles.SmallSize);
        
        var decisionCell = table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV).Text(decision).FontSize(PdfStyles.SmallSize);
        if (isRejection) 
            decisionCell.FontColor(PdfStyles.RejectionColor);

        table.Cell().BorderBottom(PdfStyles.DividerThickness).BorderColor(PdfStyles.DividerColor)
            .Padding(PdfStyles.CellPaddingH, PdfStyles.CellPaddingV).Text(status).FontSize(PdfStyles.SmallSize);
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
```

- [ ] **Step 2: Verify compilation**

Run: `dotnet build src/InterviewPlatform.Infrastructure/`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add src/InterviewPlatform.Infrastructure/Documents/CandidateCardDocument.cs
git commit -m "feat(pdf): apply elegant formal style to CandidateCardDocument"
```

---

### Task 6: Update QuestPdfService with elegant margins

**Covers:** [S6]

**Files:**
- Modify: `src/InterviewPlatform.Infrastructure/Infrastructure.cs:292-452`

**Interfaces:**
- Consumes: PdfStyles (margin constants)
- Produces: Updated QuestPdfService with new margins

- [ ] **Step 1: Update QuestPdfService margins**

```csharp
// In QuestPdfService.GenerateAsync method, update margins:
page.MarginLeft(PdfStyles.MarginLeft);
page.MarginRight(PdfStyles.MarginRight);
page.MarginTop(PdfStyles.MarginTop);
page.MarginBottom(PdfStyles.MarginBottom);
```

- [ ] **Step 2: Verify compilation**

Run: `dotnet build src/InterviewPlatform.Infrastructure/`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add src/InterviewPlatform.Infrastructure/Infrastructure.cs
git commit -m "feat(pdf): apply elegant margins to QuestPdfService"
```

---

### Task 7: Final verification and build

**Covers:** All sections

**Files:**
- All modified files

**Interfaces:**
- Consumes: All tasks above
- Produces: Final build verification

- [ ] **Step 1: Full build verification**

Run: `dotnet build InterviewPlatform.slnx`
Expected: BUILD SUCCESSFUL with no errors or warnings

- [ ] **Step 2: Verify all documents compile**

Run: `dotnet build src/InterviewPlatform.Infrastructure/ --verbosity minimal`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(pdf): complete elegant formal style implementation for all PDF documents"
```

---

## Self-Review Checklist

- [x] All 4 document classes updated with PdfStyles
- [x] PdfStyles.cs created with all constants
- [x] QuestPdfService margins updated
- [x] Font families consistent (Times New Roman for headings, body)
- [x] Decorative double-line dividers in headers
- [x] Section dividers with horizontal rules
- [x] Tables use minimal lines (no vertical borders)
- [x] Footer has decorative rule above page numbers
- [x] All margins updated to 2.5cm left/right, 2cm top/bottom
