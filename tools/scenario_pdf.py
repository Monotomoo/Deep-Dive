"""
Deep Dive — The Scenario, as a printed document.

An internal working document for the crew and for Vito: the film's bones, then
the scenario part by part. English. Everything still unresolved is marked in
the margin rather than smoothed over, because this is the version people are
meant to argue with.

The data is the app's own. `makeInitialState()` is bundled with esbuild and
dumped to JSON (see the header of `build()`), so this document can never drift
from what The Scenario view shows — and the open marks are derived from the
notes fields, not hand-listed, so they stay true as the story is edited.

Type is the app's own too: Fraunces and Spectral, converted out of the
@fontsource packages in node_modules. Falls back to Georgia if fontTools is
not installed.

    python tools/scenario_pdf.py            # writes export/Deep-Dive-Scenario.pdf
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, HRFlowable, KeepTogether, NextPageTemplate,
    PageBreak, PageTemplate, Paragraph, Spacer,
)

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "pdf-fonts"
OUT = ROOT / "export" / "Deep-Dive-Scenario.pdf"

# The app's palette, verbatim from src/index.css.
INK        = HexColor("#0a2b4f")
INK_MUTED  = HexColor("#5b7291")
INK_FAINT  = HexColor("#93a4ba")
CORAL      = HexColor("#d96c3d")
CORAL_DEEP = HexColor("#b54f26")
PAPER      = HexColor("#f4ecdc")
PAPER_LT   = HexColor("#faf4e6")
RULE       = HexColor("#d9cdb4")
OLIVE      = HexColor("#6f8a72")

MARGIN_X = 22 * mm
MARGIN_T = 20 * mm
MARGIN_B = 20 * mm


# --------------------------------------------------------------------------- fonts

def _ttf(name: str, family: str, variant: str) -> bool:
    """Build one face from @fontsource and register it. False if unavailable.

    MERGES latin WITH latin-ext, and that is not optional: the plain latin
    subset has no c-acute, c-caron or o-double-acute, so Vitomir Maricic and
    Zsofia Torocsik would print with letters silently missing from their own
    names. Their names are the first thing they will look at.
    """
    dest = CACHE / f"{name}.ttf"
    if not dest.exists():
        srcs = [ROOT / "node_modules" / "@fontsource" / family / "files"
                / f"{family}-{sub}-{variant}.woff" for sub in ("latin", "latin-ext")]
        srcs = [p for p in srcs if p.exists()]
        if not srcs:
            return False
        try:
            from fontTools.ttLib import TTFont as FTFont
            from fontTools.merge import Merger
        except ImportError:
            return False
        CACHE.mkdir(parents=True, exist_ok=True)
        parts = []
        for i, src in enumerate(srcs):
            f = FTFont(str(src))
            f.flavor = None
            tmp = CACHE / f".{name}.{i}.ttf"
            f.save(str(tmp))
            parts.append(str(tmp))
        merged = Merger().merge(parts) if len(parts) > 1 else FTFont(parts[0])
        merged.save(str(dest))
        for tmp in parts:
            Path(tmp).unlink(missing_ok=True)
    pdfmetrics.registerFont(TTFont(name, str(dest)))
    return True


def coverage(name: str) -> set[int]:
    """Codepoints a registered face can actually draw."""
    from fontTools.ttLib import TTFont as FTFont
    t = FTFont(str(CACHE / f"{name}.ttf"))
    cov: set[int] = set()
    for tb in t["cmap"].tables:
        cov.update(tb.cmap.keys())
    return cov


def register_fonts() -> dict[str, str]:
    """The app's faces where possible, Georgia where not."""
    want = [
        ("DD-Display",    "fraunces", "400-normal"),
        ("DD-DisplayI",   "fraunces", "400-italic"),
        ("DD-DisplayB",   "fraunces", "600-normal"),
        ("DD-DisplayBI",  "fraunces", "600-italic"),
        ("DD-Body",       "spectral", "400-normal"),
        ("DD-BodyI",      "spectral", "400-italic"),
        ("DD-BodyB",      "spectral", "600-normal"),
        ("DD-Sans",       "inter",    "400-normal"),
        ("DD-SansB",      "inter",    "600-normal"),
    ]
    ok = all(_ttf(*w) for w in want)
    if not ok:
        print("  · app fonts unavailable — falling back to Georgia", file=sys.stderr)
        win = Path("C:/Windows/Fonts")
        for name, file in [("DD-Display", "georgia.ttf"), ("DD-DisplayI", "georgiai.ttf"),
                           ("DD-DisplayB", "georgiab.ttf"), ("DD-DisplayBI", "georgiaz.ttf"),
                           ("DD-Body", "georgia.ttf"), ("DD-BodyI", "georgiai.ttf"),
                           ("DD-BodyB", "georgiab.ttf"), ("DD-Sans", "calibri.ttf"),
                           ("DD-SansB", "calibrib.ttf")]:
            pdfmetrics.registerFont(TTFont(name, str(win / file)))
    registerFontFamily("DD-Display", normal="DD-Display", bold="DD-DisplayB",
                       italic="DD-DisplayI", boldItalic="DD-DisplayBI")
    registerFontFamily("DD-Body", normal="DD-Body", bold="DD-BodyB",
                       italic="DD-BodyI", boldItalic="DD-BodyI")
    return {"ok": ok}


# --------------------------------------------------------------------------- styles

def styles() -> dict[str, ParagraphStyle]:
    s = {}
    s["cover-title"] = ParagraphStyle("cover-title", fontName="DD-DisplayI", fontSize=54,
                                      leading=56, textColor=INK, spaceAfter=0)
    s["cover-sub"] = ParagraphStyle("cover-sub", fontName="DD-BodyI", fontSize=13.5,
                                    leading=20, textColor=INK_MUTED)
    s["cover-thesis"] = ParagraphStyle("cover-thesis", fontName="DD-DisplayI", fontSize=21,
                                       leading=28, textColor=CORAL)
    s["label"] = ParagraphStyle("label", fontName="DD-SansB", fontSize=7.5, leading=11,
                                textColor=CORAL_DEEP, spaceAfter=4)
    s["label-faint"] = ParagraphStyle("label-faint", fontName="DD-SansB", fontSize=7,
                                      leading=10, textColor=INK_FAINT, spaceAfter=3)
    s["h1"] = ParagraphStyle("h1", fontName="DD-DisplayI", fontSize=30, leading=34,
                             textColor=INK, spaceBefore=0, spaceAfter=10)
    s["h2"] = ParagraphStyle("h2", fontName="DD-DisplayI", fontSize=17, leading=22,
                             textColor=INK, spaceBefore=12, spaceAfter=4)
    s["h3"] = ParagraphStyle("h3", fontName="DD-DisplayI", fontSize=13.5, leading=18,
                             textColor=INK, spaceBefore=8, spaceAfter=3)
    s["body"] = ParagraphStyle("body", fontName="DD-Body", fontSize=10, leading=15.5,
                               textColor=INK, spaceAfter=7, alignment=TA_JUSTIFY)
    s["body-i"] = ParagraphStyle("body-i", fontName="DD-BodyI", fontSize=10, leading=15.5,
                                 textColor=INK_MUTED, spaceAfter=7)
    s["meta"] = ParagraphStyle("meta", fontName="DD-BodyI", fontSize=9, leading=13,
                               textColor=INK_MUTED, spaceAfter=6)
    s["beat"] = ParagraphStyle("beat", fontName="DD-Body", fontSize=9.5, leading=14,
                               textColor=INK, leftIndent=11, firstLineIndent=-11, spaceAfter=2.5)
    s["quote"] = ParagraphStyle("quote", fontName="DD-DisplayI", fontSize=13, leading=18,
                                textColor=INK, leftIndent=12, spaceBefore=3, spaceAfter=6)
    s["open"] = ParagraphStyle("open", fontName="DD-SansB", fontSize=7.5, leading=12,
                               textColor=CORAL, leftIndent=11, firstLineIndent=-11, spaceAfter=2)
    s["partnum"] = ParagraphStyle("partnum", fontName="DD-DisplayI", fontSize=44, leading=48,
                                  textColor=HexColor("#cbbfa6"), spaceAfter=3)
    s["capt"] = ParagraphStyle("capt", fontName="DD-BodyI", fontSize=8.5, leading=12.5,
                               textColor=INK_FAINT, spaceAfter=4)
    return s


# --------------------------------------------------------------------------- helpers

# Glyphs that are not in latin + latin-ext, and what stands in for them.
# A missing glyph draws as nothing at all, so a dropped arrow turns
# "San Francisco -> Las Vegas" into "San Francisco  Las Vegas" with no warning.
SUBSTITUTE = {
    "→": "›",   # rightwards arrow  -> single right angle quote
    "←": "‹",   # leftwards arrow   -> single left angle quote
    "₂": "<sub>2</sub>",  # subscript two — real subscript markup instead
}


def esc(t) -> str:
    if t is None:
        return ""
    t = str(t)
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    for bad, good in SUBSTITUTE.items():
        t = t.replace(bad, good)
    return t


def rule(color=RULE, width=0.6, before=3, after=7):
    return HRFlowable(width="100%", thickness=width, color=color,
                      spaceBefore=before, spaceAfter=after, lineCap="butt")


# Anything in a notes field that reads as unfinished business.
OPEN_PAT = re.compile(
    r"to plan|to decide|to confirm|to be decided|decided with|open block|tbd|"
    r"to be agreed|pending|nothing written as fact",
    re.I,
)


def open_marks(part: dict, records: list[dict], four: list[dict]) -> list[str]:
    """Everything this part is still waiting on, read from the data itself."""
    out = []
    if part.get("notes") and OPEN_PAT.search(part["notes"]):
        out.append(part["notes"].rstrip("."))
    for b in part.get("beats", []):
        if OPEN_PAT.search(b.get("text", "")):
            out.append(b["text"].rstrip("."))
    if part.get("dateLabel", "").strip().upper() in {"TBD", ""}:
        out.append("Dates not set")
    if not part.get("location", "").strip() or part.get("location", "").strip().upper().startswith("TBD"):
        out.append("Location not set")
    # A record referenced by this part with no depth on file.
    if part.get("shootId"):
        for r in records:
            if r.get("shootId") == part["shootId"] and not r.get("depthM"):
                who = next((f["name"].split()[0] for f in four if f["key"] == r.get("personKey")), r.get("personKey"))
                out.append(f"{who}'s record here has no depth or discipline recorded")
    # De-duplicate, keep order.
    seen, uniq = set(), []
    for o in out:
        k = o.lower()[:60]
        if k not in seen:
            seen.add(k)
            uniq.append(o)
    return uniq


# --------------------------------------------------------------------------- page furniture

def make_page(title: str):
    def draw(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(PAPER_LT)
        canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
        if doc.page > 1:
            canvas.setFont("DD-Sans", 7)
            canvas.setFillColor(INK_FAINT)
            canvas.drawString(MARGIN_X, A4[1] - 13 * mm, title.upper())
            canvas.drawRightString(A4[0] - MARGIN_X, A4[1] - 13 * mm, "INTERNAL · NOT FOR CIRCULATION")
            canvas.setStrokeColor(RULE)
            canvas.setLineWidth(0.5)
            canvas.line(MARGIN_X, A4[1] - 15.5 * mm, A4[0] - MARGIN_X, A4[1] - 15.5 * mm)
            canvas.setFont("DD-DisplayI", 9)
            canvas.setFillColor(INK_FAINT)
            canvas.drawCentredString(A4[0] / 2, 12 * mm, str(doc.page))
        canvas.restoreState()
    return draw


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(HexColor("#041531"))
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setStrokeColor(CORAL)
    canvas.setLineWidth(1.2)
    canvas.line(MARGIN_X, A4[1] - 62 * mm, MARGIN_X + 34 * mm, A4[1] - 62 * mm)
    canvas.restoreState()


# --------------------------------------------------------------------------- build

def load_state() -> dict:
    """Bundle the app's seed with esbuild and dump the initial state."""
    cache = ROOT / ".cache"
    cache.mkdir(exist_ok=True)
    bundle = cache / "seed.cjs"
    subprocess.run(
        ["npx", "esbuild", "src/lib/seed.ts", "--bundle", "--format=cjs",
         "--platform=node", f"--outfile={bundle}", "--log-level=error"],
        cwd=ROOT, check=True, shell=(sys.platform == "win32"),
    )
    out = subprocess.run(
        ["node", "-e",
         "process.stdout.write(JSON.stringify(require(process.argv[1]).makeInitialState()))",
         str(bundle)],
        cwd=ROOT, check=True, capture_output=True, shell=(sys.platform == "win32"),
    )
    return json.loads(out.stdout.decode("utf-8"))


STATUS_WORD_LC = {"shot": "shot", "upcoming": "to come", "idea": "still an idea"}


def build() -> Path:
    st = load_state()
    fonts = register_fonts()
    S = styles()

    # Every character the document will draw, checked against what the faces
    # actually carry. A missing glyph renders as nothing at all — that is how
    # Maricic and Torocsik lost letters the first time this was built.
    if fonts["ok"]:
        used: set[str] = set()

        def _walk(o):
            if isinstance(o, str):
                used.update(o)
            elif isinstance(o, dict):
                for v in o.values():
                    _walk(v)
            elif isinstance(o, list):
                for v in o:
                    _walk(v)

        for k in ("scenarioArcs", "scenarioParts", "four", "threads", "topics", "devices"):
            _walk(st[k])
        cov = coverage("DD-Body") & coverage("DD-Display")
        missing = sorted(
            c for c in used
            if ord(c) > 127 and ord(c) not in cov and c not in SUBSTITUTE
        )
        if missing:
            raise SystemExit(
                "Characters in the film's own text that the fonts cannot draw: "
                + " ".join(f"U+{ord(c):04X} {c!r}" for c in missing)
                + " — add them to SUBSTITUTE or widen the font subset before shipping this."
            )
    OUT.parent.mkdir(parents=True, exist_ok=True)

    four = st["four"]
    by_key = {f["key"]: f for f in four}
    arcs = sorted(st["scenarioArcs"], key=lambda a: a["num"])
    arc_by_id = {a["id"]: a for a in arcs}
    parts = sorted(st["scenarioParts"], key=lambda p: p["order"])
    threads = sorted(st["threads"], key=lambda t: t["num"])
    topics = st["topics"]
    devices = st["devices"]
    records = st["records"]

    doc = BaseDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=MARGIN_X, rightMargin=MARGIN_X,
        topMargin=MARGIN_T, bottomMargin=MARGIN_B,
        title="Deep Dive — The Scenario",
        author="Deep Dive", subject="Internal working document",
    )
    frame = Frame(MARGIN_X, MARGIN_B, A4[0] - 2 * MARGIN_X,
                  A4[1] - MARGIN_T - MARGIN_B, id="main",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame], onPage=cover_page),
        PageTemplate(id="body", frames=[frame], onPage=make_page("Deep Dive · The Scenario")),
    ])

    F = []  # flowables
    total_open = 0

    # ---- cover -----------------------------------------------------------
    white = ParagraphStyle("w", parent=S["cover-title"], textColor=PAPER)
    F += [
        Spacer(1, 52 * mm),
        Paragraph("Deep&nbsp;Dive", white),
        Spacer(1, 14 * mm),
        Paragraph("one person holds another in the world",
                  ParagraphStyle("t", parent=S["cover-thesis"], textColor=CORAL)),
        Spacer(1, 6 * mm),
        Paragraph("not a film about depth &middot; a film about who waits for you at the surface",
                  ParagraphStyle("s", parent=S["cover-sub"], textColor=HexColor("#9fb2c9"))),
        Spacer(1, 60 * mm),
        Paragraph("THE SCENARIO", ParagraphStyle("l", parent=S["label"], textColor=CORAL, fontSize=9)),
        Paragraph(
            "A feature documentary and a three-part series about four freedivers.<br/>"
            "Internal working document &middot; for the crew and for Vito.<br/>"
            "Everything still undecided is marked in the margin.",
            ParagraphStyle("c", parent=S["cover-sub"], textColor=HexColor("#8fa3bd"), fontSize=10, leading=17)),
        NextPageTemplate("body"),
        PageBreak(),
    ]

    # ---- what this is ----------------------------------------------------
    F += [
        Paragraph("WHAT THIS IS", S["label"]),
        Paragraph("The film, and how it is built", S["h1"]),
        rule(CORAL, 0.9),
        Paragraph(
            "This is the scenario as it stands: four connected stories, told across ten parts, "
            "three of which are already shot. It is a working document, not a pitch. Where "
            "something is not decided, it says so — those marks are the most useful part of the "
            "document, because they are the list of things that still need somebody's decision "
            "before the camera turns.",
            S["body"]),
        Paragraph(
            "The film is one feature and three episodes. Three parts are in the can: Krk in April, "
            "Sicily in July, Lastovo in August. Seven are ahead, and the next of them is imminent.",
            S["body"]),
        Spacer(1, 4 * mm),
    ]

    # format summary
    shot = [p for p in parts if p["status"] == "shot"]
    upcoming = [p for p in parts if p["status"] == "upcoming"]
    idea = [p for p in parts if p["status"] == "idea"]
    F += [
        Paragraph("WHERE IT STANDS", S["label-faint"]),
        Paragraph(
            f"<b>{len(shot)} shot</b> &nbsp;&middot;&nbsp; {len(upcoming)} upcoming &nbsp;&middot;&nbsp; "
            f"{len(idea)} still an idea &nbsp;&middot;&nbsp; {len(arcs)} connected stories &nbsp;&middot;&nbsp; "
            f"{len(threads)} narrative threads &nbsp;&middot;&nbsp; {sum(len(p.get('beats', [])) for p in parts)} beats",
            S["meta"]),
        Spacer(1, 6 * mm),
    ]

    # ---- the four --------------------------------------------------------
    F += [Paragraph("THE FOUR", S["label"]), Paragraph("Who the film is about", S["h1"]), rule(CORAL, 0.9)]
    for f in four:
        block = [
            Paragraph(f"{esc(f['name'])}", S["h2"]),
            Paragraph(
                f"{esc(f['role'])} &middot; {esc(f['hometown'])} &middot; {esc(f['nationality'])}",
                S["label-faint"]),
            Paragraph(f"<i>{esc(f['epithet'])}</i>", S["body-i"]),
            Paragraph(esc(f["bio"]), S["body"]),
        ]
        if f.get("arcNote"):
            block.append(Paragraph(f"<b>Arc &middot;</b> {esc(f['arcNote'])}", S["meta"]))
        block.append(rule())
        F.append(KeepTogether(block))
    F.append(PageBreak())

    # ---- the four connected stories -------------------------------------
    F += [
        Paragraph("THE SPINE", S["label"]),
        Paragraph("Four connected stories", S["h1"]),
        rule(CORAL, 0.9),
        Paragraph(
            "Every part of the film advances one or more of these. They are the reason the "
            "scenario is not just a list of trips.", S["body-i"]),
        Spacer(1, 3 * mm),
    ]
    for a in arcs:
        who = " &middot; ".join(esc(by_key[k]["name"].split()[0]) for k in a.get("personKeys", []) if k in by_key)
        block = [
            Paragraph(f"STORY {a['num']}", S["label-faint"]),
            Paragraph(esc(a["title"]), S["h2"]),
            Paragraph(esc(a["synopsis"]), S["body"]),
            Paragraph(f"<b>Whose &middot;</b> {who}", S["meta"]),
        ]
        if a.get("notes") and OPEN_PAT.search(a["notes"]):
            total_open += 1
            block.append(Paragraph(f"&mdash;&nbsp; OPEN &middot; {esc(a['notes'])}", S["open"]))
        block.append(rule())
        F.append(KeepTogether(block))
    F.append(PageBreak())

    # ---- threads ---------------------------------------------------------
    F += [
        Paragraph("THE THREADS", S["label"]),
        Paragraph("Ten arcs that run across every location", S["h1"]),
        rule(CORAL, 0.9),
    ]
    for t in threads:
        F.append(KeepTogether([
            Paragraph(f"<b>{t['num']:02d}</b> &nbsp; {esc(t['title'])} <font color='#93a4ba'>&mdash; {esc(t['subtitle'])}</font>", S["h3"]),
            Paragraph(esc(t["synopsis"]), S["body"]),
        ]))
    F.append(PageBreak())

    # ---- grammar + topics -----------------------------------------------
    F += [
        Paragraph("THE GRAMMAR", S["label"]),
        Paragraph("How the film speaks", S["h1"]),
        rule(CORAL, 0.9),
    ]
    for dv in devices:
        name = dv.get("name") or dv.get("title") or ""
        desc = dv.get("description") or dv.get("note") or ""
        F.append(KeepTogether([
            Paragraph(esc(name), S["h3"]),
            Paragraph(esc(desc), S["body"]),
        ]))
    F += [
        Spacer(1, 6 * mm),
        Paragraph("WHAT THE INTERVIEWS MINE", S["label"]),
        Paragraph("The questions underneath", S["h1"]),
        rule(CORAL, 0.9),
    ]
    for t in topics:
        F.append(Paragraph(
            f"<b>{esc(t['title'])}</b> &nbsp;&mdash;&nbsp; <i>{esc(t['question'])}</i>",
            ParagraphStyle("tp", parent=S["body"], spaceAfter=4, alignment=0)))
    F.append(PageBreak())

    # ---- the parts -------------------------------------------------------
    F += [
        Paragraph("THE SCENARIO", S["label"]),
        Paragraph("Part by part", S["h1"]),
        rule(CORAL, 0.9),
        Paragraph(
            "Ten parts in order. For the three already shot, what happened. For the seven ahead, "
            "what has to be got.", S["body-i"]),
        Spacer(1, 5 * mm),
    ]
    STATUS_COLOR = {"shot": OLIVE, "upcoming": CORAL, "idea": INK_FAINT}
    for p in parts:
        marks = open_marks(p, records, four)
        col = STATUS_COLOR.get(p["status"], INK_FAINT)
        tail = (f" <font color='#{CORAL.hexval()[4:]}'>&middot; {len(marks)} open</font>"
                if marks else "")
        F.append(Paragraph(
            f"<font color='#cbbfa6'>{p['order']:02d}</font> &nbsp; "
            f"<b>{esc(p['title'])}</b> "
            f"<font color='#93a4ba'>&mdash; {esc(p['dateLabel'])}</font> &nbsp; "
            f"<font color='#{col.hexval()[4:]}'>{STATUS_WORD_LC.get(p['status'], p['status'])}</font>"
            + tail,
            ParagraphStyle("toc", parent=S["body"], alignment=0, spaceAfter=5, fontSize=10.5)))
    F.append(PageBreak())

    STATUS_WORD = {"shot": "SHOT", "upcoming": "TO COME", "idea": "STILL AN IDEA"}
    for p in parts:
        marks = open_marks(p, records, four)
        total_open += len(marks)
        story_names = [f"Story {arc_by_id[i]['num']}" for i in (p.get("arcIds") or []) if i in arc_by_id]
        people = [by_key[k]["name"].split()[0] for k in (p.get("peopleKeys") or []) if k in by_key]

        F += [
            Paragraph(f"{p['order']}", S["partnum"]),
            Paragraph(esc(p.get("kicker") or ""), S["label"]) if p.get("kicker") else Spacer(1, 0),
            Paragraph(esc(p["title"]), S["h1"]),
            Paragraph(
                f"{esc(p['location'])} &nbsp;&middot;&nbsp; {esc(p['dateLabel'])} "
                f"&nbsp;&middot;&nbsp; <b>{STATUS_WORD.get(p['status'], p['status']).upper()}</b>"
                + (f" &nbsp;&middot;&nbsp; {esc(p['episodeHint'])}" if p.get("episodeHint") else ""),
                S["meta"]),
            rule(CORAL, 0.9),
        ]
        if p.get("background"):
            F.append(Paragraph(esc(p["background"]), S["body"]))
        if p.get("whatHappened"):
            F += [Paragraph("WHAT HAPPENED", S["label-faint"]),
                  Paragraph(esc(p["whatHappened"]), S["body"])]
        if p.get("beats"):
            F.append(Paragraph("BEATS" if p["status"] == "shot" else "TO GET", S["label-faint"]))
            for b in p["beats"]:
                F.append(Paragraph(f"&mdash;&nbsp; {esc(b['text'])}", S["beat"]))
            F.append(Spacer(1, 2 * mm))
        for q in (p.get("quotes") or []):
            F.append(Paragraph(f"&ldquo;{esc(q)}&rdquo;", S["quote"]))
        if story_names or people:
            bits = []
            if story_names:
                bits.append("<b>Advances &middot;</b> " + " &middot; ".join(story_names))
            if people:
                bits.append("<b>Who &middot;</b> " + " &middot; ".join(esc(x) for x in people))
            F.append(Paragraph(" &nbsp;&nbsp;|&nbsp;&nbsp; ".join(bits), S["meta"]))
        if marks:
            F.append(Spacer(1, 2 * mm))
            F.append(Paragraph("STILL OPEN", ParagraphStyle("o", parent=S["label"], textColor=CORAL)))
            for mk in marks:
                F.append(Paragraph(f"&mdash;&nbsp; {esc(mk)}", S["open"]))
        F.append(PageBreak())

    # ---- what is still open ---------------------------------------------
    F += [
        Paragraph("BEFORE THIS GOES ANYWHERE", S["label"]),
        Paragraph("What is still open", S["h1"]),
        rule(CORAL, 0.9),
        Paragraph(
            f"{total_open} things in this document are not settled. They are marked in place, "
            "and collected here so nothing has to be hunted for. Most need one conversation.",
            S["body-i"]),
        Spacer(1, 3 * mm),
    ]
    for a in arcs:
        if a.get("notes") and OPEN_PAT.search(a["notes"]):
            F.append(Paragraph(f"<b>Story {a['num']} &middot; {esc(a['title'])}</b>", S["h3"]))
            F.append(Paragraph(f"&mdash;&nbsp; {esc(a['notes'])}", S["open"]))
    for p in parts:
        marks = open_marks(p, records, four)
        if marks:
            F.append(Paragraph(f"<b>Part {p['order']} &middot; {esc(p['title'])}</b>", S["h3"]))
            for mk in marks:
                F.append(Paragraph(f"&mdash;&nbsp; {esc(mk)}", S["open"]))

    F += [
        Spacer(1, 8 * mm),
        rule(CORAL, 0.9),
        Paragraph(
            "Generated from the Deep Dive app &middot; The Scenario and The Four. "
            "Edit there and run this again; the open marks are read from the notes, "
            "so they stay true.", S["capt"]),
    ]

    doc.build(F)
    return OUT


if __name__ == "__main__":
    path = build()
    print(f"wrote {path}  ({path.stat().st_size / 1024:.0f} KB)")
