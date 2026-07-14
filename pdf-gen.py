"""
Deep Dive - PDF generator for the Producer's Library.
Individual styled PDFs for each markdown doc + one combined Master Book.
Style: cream paper, deep sea-green ink, Georgia serif body, Consolas eyebrows.
Adapted from the proven Ribanje pilot-pdf-gen.py pipeline.
"""
import re
import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether, HRFlowable,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

BASE = Path(r'D:\CLAUDE PROJECTS\Deep Dive V1.1')
OUT = BASE / 'PDF'

# ----- Brand -----
PAPER = HexColor('#FAF6EC')
INK = HexColor('#182E29')
INK_MUTED = HexColor('#3E524C')
SEA = HexColor('#1E5C50')
SEA_DEEP = HexColor('#154439')
MUTED = HexColor('#6E6A5C')

WIN_FONTS = Path('C:/Windows/Fonts')


def register_fonts():
    fonts = [
        ('Georgia', 'georgia.ttf'),
        ('Georgia-Italic', 'georgiai.ttf'),
        ('Georgia-Bold', 'georgiab.ttf'),
        ('Georgia-BoldItalic', 'georgiaz.ttf'),
        ('Consolas', 'consola.ttf'),
        ('Consolas-Bold', 'consolab.ttf'),
        ('Consolas-Italic', 'consolai.ttf'),
    ]
    for name, file in fonts:
        path = WIN_FONTS / file
        if not path.exists():
            print(f'Missing font: {path}', file=sys.stderr)
            continue
        pdfmetrics.registerFont(TTFont(name, str(path)))
    registerFontFamily('Georgia', normal='Georgia', bold='Georgia-Bold',
                       italic='Georgia-Italic', boldItalic='Georgia-BoldItalic')
    registerFontFamily('Consolas', normal='Consolas', bold='Consolas-Bold',
                       italic='Consolas-Italic')


PAGE_W, PAGE_H = A4
M_L = M_R = 2.3 * cm
M_T = 2.5 * cm
M_B = 2.3 * cm
TEXT_W = PAGE_W - M_L - M_R


def make_styles():
    return {
        'cover_eyebrow': ParagraphStyle('ce', fontName='Consolas', fontSize=9,
                                        textColor=SEA, alignment=1, leading=14, spaceAfter=8),
        'cover_title': ParagraphStyle('ct', fontName='Georgia-Italic', fontSize=64,
                                      textColor=INK, alignment=1, leading=72, spaceAfter=4),
        'cover_sub': ParagraphStyle('cs', fontName='Georgia', fontSize=15,
                                    textColor=SEA_DEEP, alignment=1, leading=22, spaceAfter=2),
        'cover_line': ParagraphStyle('cl', fontName='Georgia-Italic', fontSize=11.5,
                                     textColor=INK_MUTED, alignment=1, leading=17, spaceAfter=2),
        'cover_meta': ParagraphStyle('cm', fontName='Consolas', fontSize=8.5,
                                     textColor=MUTED, alignment=1, leading=12),
        'part_num': ParagraphStyle('pn', fontName='Consolas-Bold', fontSize=46,
                                   textColor=SEA, leading=52, spaceAfter=2),
        'part_title': ParagraphStyle('pt', fontName='Georgia-Italic', fontSize=25,
                                     textColor=INK, leading=31, spaceAfter=6),
        'doc_title': ParagraphStyle('dt', fontName='Georgia-Italic', fontSize=22,
                                    textColor=INK, leading=28, spaceAfter=8),
        'h2': ParagraphStyle('h2', fontName='Georgia-Bold', fontSize=14.5,
                             textColor=SEA_DEEP, leading=19, spaceBefore=18, spaceAfter=6),
        'h3': ParagraphStyle('h3', fontName='Georgia-Bold', fontSize=11.5,
                             textColor=INK, leading=16, spaceBefore=12, spaceAfter=4),
        'sub': ParagraphStyle('sb', fontName='Consolas-Bold', fontSize=9,
                              textColor=SEA, leading=13, spaceBefore=8, spaceAfter=3),
        'body': ParagraphStyle('bd', fontName='Georgia', fontSize=10,
                               textColor=INK, leading=15.5, spaceBefore=3, spaceAfter=3, alignment=4),
        'bullet': ParagraphStyle('bl', fontName='Georgia', fontSize=10,
                                 textColor=INK, leading=14.5, leftIndent=16,
                                 bulletIndent=4, spaceBefore=2, spaceAfter=2),
        'quote': ParagraphStyle('qt', fontName='Georgia-Italic', fontSize=10,
                                textColor=INK_MUTED, leading=15.5, leftIndent=20,
                                rightIndent=16, spaceBefore=8, spaceAfter=8),
        'toc_item': ParagraphStyle('ti', fontName='Georgia', fontSize=11.5,
                                   textColor=INK, leading=17, spaceBefore=6),
        'toc_desc': ParagraphStyle('td2', fontName='Georgia-Italic', fontSize=9.5,
                                   textColor=MUTED, leading=13, leftIndent=26, spaceAfter=4),
        'th': ParagraphStyle('th', fontName='Consolas-Bold', fontSize=7.8,
                             textColor=SEA_DEEP, leading=11),
        'td': ParagraphStyle('td', fontName='Georgia', fontSize=9,
                             textColor=INK, leading=13),
        'td_label': ParagraphStyle('tl', fontName='Georgia-Bold', fontSize=9,
                                   textColor=INK, leading=13),
        'td_small': ParagraphStyle('ts', fontName='Georgia', fontSize=8,
                                   textColor=INK, leading=11.5),
        'th_small': ParagraphStyle('ths', fontName='Consolas-Bold', fontSize=7,
                                   textColor=SEA_DEEP, leading=10),
    }


def make_painter(footer_label):
    def paint(canv, doc):
        canv.saveState()
        canv.setFillColor(PAPER)
        canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        n = canv.getPageNumber()
        if n > 1:
            canv.setStrokeColor(SEA)
            canv.setLineWidth(0.4)
            canv.line(M_L, M_B - 14, PAGE_W - M_R, M_B - 14)
            canv.setFont('Consolas', 7.5)
            canv.setFillColor(MUTED)
            canv.drawString(M_L, M_B - 26, footer_label)
            canv.drawRightString(PAGE_W - M_R, M_B - 26, f'{n - 1:02d}')
        else:
            canv.setFillColor(SEA)
            canv.setFont('Consolas', 7.5)
            canv.drawString(M_L, M_B - 14, 'DEEP DIVE · ONEMASTERTAKE')
            canv.drawRightString(PAGE_W - M_R, M_B - 14, '2026')
        canv.restoreState()
    return paint


# ----- Text sanitizing (Georgia glyph coverage) -----
GLYPH_MAP = {
    '→': '›',   # -> right arrow to single guillemet
    '←': '‹',
    '≥': '>=', '≤': '<=', '≈': '~', '−': '-',
    '✅': '(done)', '⏳': '(pending)', '⚠️': '(!)', '⚠': '(!)',
    '⭐': '*', '★': '*', '☆': '*',
    '✓': '(ok)', '✔': '(ok)', '☐': '[ ]', '☑': '[x]',
    '️': '', '​': '',
    '⁉': '?!',
}
EMOJI_RE = re.compile('[\U0001F000-\U0001FAFF☀-➿⌀-⏿⬀-⯿]')


def sanitize(text):
    for k, v in GLYPH_MAP.items():
        text = text.replace(k, v)
    return EMOJI_RE.sub('', text)


def format_inline(text):
    text = sanitize(text)
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # inline code
    text = re.sub(r'`([^`]+?)`',
                  r'<font face="Consolas" size="8.5" color="#154439">\1</font>', text)
    # bold, then italics
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'(?<!\*)\*([^*\n]+?)\*(?!\*)', r'<i>\1</i>', text)
    # links -> clickable, sea-green
    text = re.sub(r'\[([^\]]+?)\]\((https?://[^)\s]+?)\)',
                  r'<a href="\2"><font color="#1E5C50"><u>\1</u></font></a>', text)
    # non-http links (file refs) -> just italic text
    text = re.sub(r'\[([^\]]+?)\]\(([^)]*?)\)', r'<i>\1</i>', text)
    return text


def is_block_start(line):
    s = line.strip()
    return (s.startswith('#') or s.startswith('- ') or s.startswith('|')
            or s.startswith('>') or s == '---' or re.match(r'^\d+[\.\)]\s', s))


def build_table(table_lines, styles):
    rows = []
    for line in table_lines:
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        rows.append(cells)
    rows = [r for r in rows if not all(re.match(r'^[\-\:\s]*$', c) for c in r)]
    if not rows:
        return [Spacer(1, 0)]

    n_cols = max(len(r) for r in rows)
    small = n_cols >= 4
    th = styles['th_small'] if small else styles['th']
    td = styles['td_small'] if small else styles['td']
    td_label = styles['td_label'] if not small else styles['td_small']

    data = []
    for ri, row in enumerate(rows):
        row = row + [''] * (n_cols - len(row))
        cells = []
        for ci, cell in enumerate(row):
            if ri == 0:
                st = th
            elif ci == 0:
                st = td_label
            else:
                st = td
            cells.append(Paragraph(format_inline(cell), st))
        data.append(cells)

    if n_cols == 2:
        widths = [TEXT_W * 0.30, TEXT_W * 0.70]
    elif n_cols == 3:
        widths = [TEXT_W * 0.24, TEXT_W * 0.38, TEXT_W * 0.38]
    else:
        widths = [TEXT_W / n_cols] * n_cols

    pad = 4 if small else 6
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), pad),
        ('BOTTOMPADDING', (0, 0), (-1, -1), pad),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('LINEABOVE', (0, 0), (-1, 0), 0.8, SEA),
        ('LINEBELOW', (0, 0), (-1, 0), 0.35, SEA),
        ('LINEBELOW', (0, -1), (-1, -1), 0.8, SEA),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [PAPER, HexColor('#F3EDDD')]),
    ]))
    flow = [Spacer(1, 4), t, Spacer(1, 8)]
    if len(data) <= 6:
        return [KeepTogether(flow)]
    return flow


def parse_markdown(md_text, styles, skip_h1=False):
    lines = md_text.split('\n')
    story = []
    i = 0
    h1_seen = False

    while i < len(lines):
        line = lines[i].rstrip()

        if not line:
            i += 1
            continue

        if line.strip() == '---':
            story.append(HRFlowable(width='25%', thickness=0.4, color=SEA,
                                    hAlign='LEFT', spaceBefore=6, spaceAfter=8))
            i += 1
            continue

        if line.startswith('# ') and not line.startswith('## '):
            h1_seen = True
            if not skip_h1:
                story.append(Paragraph(format_inline(line[2:].strip()), styles['doc_title']))
                story.append(HRFlowable(width='45%', thickness=0.7, color=SEA,
                                        hAlign='LEFT', spaceBefore=2, spaceAfter=14))
            i += 1
            continue

        if line.startswith('## '):
            story.append(Paragraph(format_inline(line[3:].strip()), styles['h2']))
            story.append(HRFlowable(width='18%', thickness=0.5, color=SEA,
                                    hAlign='LEFT', spaceBefore=0, spaceAfter=6))
            i += 1
            continue

        if line.startswith('### '):
            story.append(Paragraph(format_inline(line[4:].strip()), styles['h3']))
            i += 1
            continue

        if line.startswith('#### '):
            story.append(Paragraph(format_inline(line[5:].strip()), styles['sub']))
            i += 1
            continue

        if line.strip().startswith('|'):
            tl = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                tl.append(lines[i])
                i += 1
            story.extend(build_table(tl, styles))
            continue

        if line.lstrip().startswith('- '):
            while i < len(lines) and lines[i].lstrip().startswith('- '):
                b = lines[i].lstrip()[2:].rstrip()
                story.append(Paragraph(format_inline(b), styles['bullet'], bulletText='·'))
                i += 1
            continue

        m = re.match(r'^(\d+)[\.\)]\s+(.*)$', line.strip())
        if m:
            story.append(Paragraph(format_inline(m.group(2)), styles['bullet'],
                                   bulletText=f'{m.group(1)}.'))
            i += 1
            continue

        if line.startswith('>'):
            ql = []
            while i < len(lines) and lines[i].startswith('>'):
                ql.append(lines[i].lstrip('>').strip())
                i += 1
            while ql and not ql[-1]:
                ql.pop()
            story.append(Paragraph('<br/>'.join(format_inline(q) for q in ql if q is not None),
                                   styles['quote']))
            continue

        # paragraph
        para = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not is_block_start(lines[i]):
            para.append(lines[i])
            i += 1
        story.append(Paragraph(format_inline(' '.join(para)), styles['body']))

    return story


def build_doc(out_path, story, footer_label, title, subject):
    doc = BaseDocTemplate(
        str(out_path), pagesize=A4,
        leftMargin=M_L, rightMargin=M_R, topMargin=M_T, bottomMargin=M_B,
        title=title, author='Tomislav Kovacic / OneMasterTake',
        subject=subject, creator='Deep Dive production OS',
    )
    frame = Frame(M_L, M_B, TEXT_W, PAGE_H - M_T - M_B, id='main', showBoundary=0)
    doc.addPageTemplates([PageTemplate(id='main', frames=[frame],
                                       onPage=make_painter(footer_label))])
    doc.build(story)
    print(f'  {out_path.name}  ({out_path.stat().st_size / 1024:.0f} KB)')


# ----- The library -----
DOCS = [
    ('PRODUCER-MASTER-STRATEGY.md', 'I',    "The Producer's Master Strategy",
     'The playbook: the job, the map, the money, the machinery, the market, execution.'),
    ('MASTER-PLAN.md', 'II',   'The Master Plan',
     'Dated operating plan: deadlines, financing lanes, rights checklist, risks.'),
    ('COPRODUCER-SHORTLIST.md', 'III',  'Co-Producer Shortlist',
     'Croatian partners ranked, with the HAVC prijavnica mechanics.'),
    ('US-FUNDS.md', 'IV',   'US & International Funds Map',
     'Grants open now, opening later, and confirmed dead ends.'),
    ('RESEARCH-CRAFT.md', 'V',    'Research: The Producing Craft',
     'Stages, roles, the dual-hat problem, post workflow, festival mechanics.'),
    ('RESEARCH-MONEY.md', 'VI',   'Research: The Money Side',
     'Budget anatomy, cash flow, waterfall, co-production and rebate mechanics.'),
    ('RESEARCH-LEGAL-DELIVERY.md', 'VII',  'Research: Legal, Delivery & Sales',
     'Chain of title, E&O, contracts, the delivery spec, sensitive content.'),
    ('RELEASES-DRAFT.md', 'VIII', 'Releases: Draft Terms',
     'Participant and life-story terms for the lawyer, incl. the 2023 chapter.'),
    ('IDFA-FORUM-ENTRY-DRAFT.md', 'IX',   'IDFA Forum Entry Draft',
     'The 25 July submission: logline, synopsis, finance plan, checklist.'),
]


def build_cover(styles):
    s = []
    s.append(Spacer(1, 5.2 * cm))
    s.append(Paragraph('FOUR DIVERS · ONE BREATH · THE BUSINESS OF THE FILM',
                       styles['cover_eyebrow']))
    s.append(Spacer(1, 4))
    s.append(Paragraph('Deep Dive', styles['cover_title']))
    s.append(Spacer(1, 6))
    s.append(Paragraph("The Producer's Master Book", styles['cover_sub']))
    s.append(Spacer(1, 14))
    s.append(HRFlowable(width='26%', thickness=0.5, color=SEA, hAlign='CENTER'))
    s.append(Spacer(1, 16))
    s.append(Paragraph('strategy · money · law · market · execution', styles['cover_line']))
    s.append(Paragraph('<i>one person holds another in the world</i>', styles['cover_line']))
    s.append(Spacer(1, 4.4 * cm))
    s.append(Paragraph('VERSION 1.0 · JULY 2026 · ONEMASTERTAKE', styles['cover_meta']))
    s.append(Spacer(1, 4))
    s.append(Paragraph('for Tomo — producer & director', styles['cover_meta']))
    return s


def build_toc(styles):
    s = []
    s.append(Paragraph('Contents', styles['doc_title']))
    s.append(HRFlowable(width='45%', thickness=0.7, color=SEA, hAlign='LEFT',
                        spaceBefore=2, spaceAfter=16))
    for _, num, title, desc in DOCS:
        s.append(Paragraph(f'<font face="Consolas-Bold" color="#1E5C50" size="9">{num}</font>'
                           f' &nbsp; <b>{title}</b>', styles['toc_item']))
        s.append(Paragraph(desc, styles['toc_desc']))
    return s


def main():
    register_fonts()
    OUT.mkdir(exist_ok=True)
    styles = make_styles()

    # Individual PDFs
    print('Individual PDFs:')
    for fname, num, title, desc in DOCS:
        md = (BASE / fname).read_text(encoding='utf-8')
        story = parse_markdown(md, styles, skip_h1=False)
        out = OUT / (Path(fname).stem + '.pdf')
        build_doc(out, story, f'DEEP DIVE · {title.upper()}', f'Deep Dive · {title}', desc)

    # Master book
    print('Master book:')
    story = []
    story.extend(build_cover(styles))
    story.append(PageBreak())
    story.extend(build_toc(styles))
    for fname, num, title, desc in DOCS:
        md = (BASE / fname).read_text(encoding='utf-8')
        story.append(PageBreak())
        story.append(Spacer(1, 5))
        story.append(Paragraph(num, styles['part_num']))
        story.append(Paragraph(title, styles['part_title']))
        story.append(Paragraph(f'<i>{desc}</i>', styles['quote']))
        story.append(HRFlowable(width='45%', thickness=0.7, color=SEA,
                                hAlign='LEFT', spaceBefore=4, spaceAfter=16))
        story.extend(parse_markdown(md, styles, skip_h1=True))
    build_doc(OUT / 'DEEP DIVE - Producers Master Book.pdf', story,
              "DEEP DIVE · PRODUCER'S MASTER BOOK · 2026",
              "Deep Dive · The Producer's Master Book",
              'The complete producing strategy, money, legal and market playbook.')


if __name__ == '__main__':
    main()
