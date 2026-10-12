import os
import sys
import re
import json
import base64
import urllib.request
import subprocess
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

MD_PATH = r"d:\PROJECK\batu bara\coal-ash-app\docs\DOKUMENTASI_LENGKAP_COAL_ASH_APP.md"
HTML_PATH = r"d:\PROJECK\batu bara\coal-ash-app\docs\DOKUMENTASI_ARSITEKTUR_COAL_ASH_APP.html"
PDF_PATH = r"d:\PROJECK\batu bara\coal-ash-app\docs\DOKUMENTASI_ARSITEKTUR_COAL_ASH_APP.pdf"
DOWNLOADS_PDF = r"C:\Users\ACER NITRO 5\Downloads\DOKUMENTASI_ARSITEKTUR_COAL_ASH_APP.pdf"
WORKSPACE_PDF = r"d:\PROJECK\batu bara\DOKUMENTASI_ARSITEKTUR_COAL_ASH_APP.pdf"
EDGE_EXE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

print("1. Membaca berkas markdown:", MD_PATH)
with open(MD_PATH, "r", encoding="utf-8") as f:
    raw_md = f.read()

def fetch_mermaid_svg(code_str):
    """Mengambil SVG dari mermaid.ink dengan tema neutral/clean"""
    try:
        obj = {
            "code": code_str.strip(),
            "mermaid": {
                "theme": "neutral",
                "themeVariables": {
                    "fontFamily": "Segoe UI, Arial, sans-serif",
                    "fontSize": "13px",
                    "primaryColor": "#e2e8f0",
                    "primaryBorderColor": "#64748b",
                    "lineColor": "#475569"
                }
            }
        }
        b64 = base64.urlsafe_b64encode(json.dumps(obj).encode("utf-8")).decode("utf-8")
        url = f"https://mermaid.ink/svg/{b64}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            svg = resp.read().decode("utf-8")
            # Pastikan respons adalah SVG valid
            if "<svg" in svg:
                # Bersihkan style inline yang bisa merusak print
                svg = re.sub(r'max-width:[^;"]+;?', '', svg)
                return svg
    except Exception as e:
        print(f"   [Peringatan] Gagal mengambil Mermaid SVG: {e}")
    return None

# Ekstraksi dan penggantian mermaid blocks
mermaid_counter = 0
mermaid_cache = {}

def process_mermaid_block(match):
    global mermaid_counter
    mermaid_counter += 1
    code = match.group(1).strip()
    print(f"2. Memproses Diagram Mermaid #{mermaid_counter}...")
    svg = fetch_mermaid_svg(code)
    if svg:
        print(f"   ✓ Berhasil mendapatkan SVG ({len(svg)} bytes)")
        return f'\n\n<div class="mermaid-diagram-card"><div class="diagram-caption">Diagram #{mermaid_counter}</div>\n{svg}\n</div>\n\n'
    else:
        print(f"   ✕ Fallback ke format teks")
        return f'\n\n<pre class="mermaid-code"><code>{code}</code></pre>\n\n'

# Proses semua ```mermaid ... ```
processed_md = re.sub(r'```mermaid\s*\n(.*?)\n```', process_mermaid_block, raw_md, flags=re.DOTALL)

def format_inline(text):
    # Inline code
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    # Math formatting: $$...$$ atau $...$
    text = re.sub(r'\$\$([^$]+)\$\$', r'<div class="math-block"><span class="math-content">\1</span></div>', text)
    text = re.sub(r'\$([^$]+)\$', r'<span class="math-inline">\1</span>', text)
    # Bold & Italic
    text = re.sub(r'\*\*\*([^*]+)\*\*\*', r'<strong><em>\1</em></strong>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    # Links
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    return text

def parse_markdown_to_html(md_text):
    lines = md_text.split('\n')
    html_out = []
    in_table = False
    table_rows = []
    in_code_block = False
    code_lang = ""
    code_lines = []
    in_blockquote = False
    blockquote_lines = []

    def flush_table():
        nonlocal in_table, table_rows
        if not table_rows:
            in_table = False
            return
        
        t_html = ['<div class="table-container"><table>']
        # baris 0 adalah header
        header_cells = [c.strip() for c in table_rows[0].strip('|').split('|')]
        t_html.append('<thead><tr>')
        for c in header_cells:
            t_html.append(f'<th>{format_inline(c)}</th>')
        t_html.append('</tr></thead><tbody>')

        # baris 1 biasanya separator |---|---|
        data_rows = table_rows[2:] if len(table_rows) > 1 and re.match(r'^[\s\|:\-]+$', table_rows[1]) else table_rows[1:]
        for r in data_rows:
            cells = [c.strip() for c in r.strip('|').split('|')]
            t_html.append('<tr>')
            for c in cells:
                t_html.append(f'<td>{format_inline(c)}</td>')
            t_html.append('</tr>')
        t_html.append('</tbody></table></div>')
        html_out.append('\n'.join(t_html))
        table_rows = []
        in_table = False

    def flush_code():
        nonlocal in_code_block, code_lines, code_lang
        joined = '\n'.join(code_lines)
        # Escape HTML entities
        escaped = joined.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        html_out.append(f'<pre class="code-block {code_lang}"><code>{escaped}</code></pre>')
        code_lines = []
        in_code_block = False
        code_lang = ""

    def flush_blockquote():
        nonlocal in_blockquote, blockquote_lines
        content = ' '.join(blockquote_lines)
        callout_type = "note"
        title = "CATATAN"
        if "[!NOTE]" in content:
            content = content.replace("[!NOTE]", "")
            callout_type = "note"
            title = "CATATAN PENTING"
        elif "[!IMPORTANT]" in content:
            content = content.replace("[!IMPORTANT]", "")
            callout_type = "important"
            title = "PERHATIAN PENTING"
        elif "[!WARNING]" in content:
            content = content.replace("[!WARNING]", "")
            callout_type = "warning"
            title = "PERINGATAN"
        elif "[!TIP]" in content:
            content = content.replace("[!TIP]", "")
            callout_type = "tip"
            title = "TIPS MUTU"

        html_out.append(f'<div class="callout callout-{callout_type}"><div class="callout-header">{title}</div><div class="callout-body">{format_inline(content.strip())}</div></div>')
        blockquote_lines = []
        in_blockquote = False

    for line in lines:
        stripped = line.strip()

        # Check raw HTML like mermaid diagrams already injected
        if stripped.startswith('<div class="mermaid-diagram-card">') or stripped.startswith('<pre class="mermaid-code">'):
            if in_table: flush_table()
            if in_code_block: flush_code()
            if in_blockquote: flush_blockquote()
            html_out.append(line)
            continue
        if stripped.endswith('</div>') and ('class="mermaid-diagram-card"' in ''.join(html_out[-3:])):
            html_out.append(line)
            continue

        # Code block toggle
        if stripped.startswith('```'):
            if in_code_block:
                flush_code()
            else:
                if in_table: flush_table()
                if in_blockquote: flush_blockquote()
                in_code_block = True
                code_lang = stripped[3:].strip()
                code_lines = []
            continue

        if in_code_block:
            code_lines.append(line)
            continue

        # Blockquote
        if stripped.startswith('>'):
            if in_table: flush_table()
            in_blockquote = True
            blockquote_lines.append(stripped.lstrip('>').strip())
            continue
        elif in_blockquote:
            flush_blockquote()

        # Table rows
        if stripped.startswith('|') and stripped.endswith('|'):
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(stripped)
            continue
        elif in_table:
            flush_table()

        # Blank line
        if not stripped:
            continue

        # Headings
        if stripped.startswith('# '):
            html_out.append(f'<h1 class="doc-h1">{format_inline(stripped[2:])}</h1>')
        elif stripped.startswith('## '):
            html_out.append(f'<h2 class="doc-h2">{format_inline(stripped[3:])}</h2>')
        elif stripped.startswith('### '):
            html_out.append(f'<h3 class="doc-h3">{format_inline(stripped[4:])}</h3>')
        elif stripped.startswith('#### '):
            html_out.append(f'<h4 class="doc-h4">{format_inline(stripped[5:])}</h4>')
        elif stripped.startswith('---'):
            html_out.append('<hr class="doc-divider"/>')
        elif re.match(r'^[\*\-]\s', stripped):
            html_out.append(f'<li class="doc-li">{format_inline(stripped[2:])}</li>')
        elif re.match(r'^\d+\.\s', stripped):
            content = re.sub(r'^\d+\.\s', '', stripped)
            html_out.append(f'<li class="doc-li-num">{format_inline(content)}</li>')
        else:
            html_out.append(f'<p class="doc-p">{format_inline(stripped)}</p>')

    if in_table: flush_table()
    if in_code_block: flush_code()
    if in_blockquote: flush_blockquote()

    return '\n'.join(html_out)

print("3. Mengonversi Markdown ke format HTML Semantik...")
body_html = parse_markdown_to_html(processed_md)

CSS_STYLES = """
@page {
  size: A4 portrait;
  margin: 18mm 14mm 18mm 14mm;
  @top-right {
    content: "LIMS ISO/IEC 17025 - Analisis Kadar Abu Batubara";
    font-size: 7.5pt;
    color: #64748b;
  }
  @bottom-right {
    content: "Halaman " counter(page);
    font-size: 8pt;
    color: #64748b;
  }
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 9.5pt;
  line-height: 1.55;
  color: #1e293b;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
}

/* Header & Cover Banner */
.doc-header {
  border-bottom: 3px double #0f172a;
  padding-bottom: 12pt;
  margin-bottom: 18pt;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lab-badge {
  display: inline-block;
  background: #0f172a;
  color: #ffffff;
  font-size: 8pt;
  font-weight: 800;
  padding: 3pt 8pt;
  border-radius: 4pt;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 6pt;
}

.doc-h1 {
  font-size: 16pt;
  font-weight: 800;
  color: #0f172a;
  margin: 14pt 0 8pt 0;
  page-break-before: always;
  border-bottom: 1.5pt solid #cbd5e1;
  padding-bottom: 4pt;
}

/* H1 pertama tidak perlu page break */
h1.doc-h1:first-of-type,
.first-h1 {
  page-break-before: avoid !important;
  margin-top: 0 !important;
}

.doc-h2 {
  font-size: 12.5pt;
  font-weight: 700;
  color: #1e293b;
  margin: 14pt 0 6pt 0;
  page-break-after: avoid;
  border-left: 3.5pt solid #2563eb;
  padding-left: 6pt;
}

.doc-h3 {
  font-size: 10.5pt;
  font-weight: 700;
  color: #334155;
  margin: 10pt 0 4pt 0;
  page-break-after: avoid;
}

.doc-h4 {
  font-size: 9.5pt;
  font-weight: 700;
  color: #475569;
  margin: 8pt 0 3pt 0;
  page-break-after: avoid;
}

.doc-p {
  margin: 0 0 6pt 0;
  text-align: justify;
}

.doc-divider {
  border: none;
  border-top: 1pt solid #e2e8f0;
  margin: 12pt 0;
}

/* List */
.doc-li, .doc-li-num {
  margin: 2pt 0 2pt 18pt;
}

/* Tables */
.table-container {
  margin: 10pt 0;
  page-break-inside: avoid;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  line-height: 1.35;
}

th {
  background-color: #0f172a;
  color: #ffffff;
  font-weight: 700;
  padding: 5pt 7pt;
  border: 1pt solid #0f172a;
  text-align: left;
}

td {
  padding: 4.5pt 6.5pt;
  border: 0.75pt solid #cbd5e1;
  vertical-align: top;
}

tr:nth-child(even) td {
  background-color: #f8fafc;
}

/* Callouts */
.callout {
  border-radius: 4pt;
  padding: 8pt 10pt;
  margin: 10pt 0;
  page-break-inside: avoid;
  border-left: 4pt solid #2563eb;
  background-color: #eff6ff;
}

.callout-header {
  font-weight: 800;
  font-size: 8.5pt;
  color: #1e40af;
  margin-bottom: 3pt;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.callout-body {
  font-size: 8.5pt;
  color: #1e293b;
}

.callout-important {
  border-left-color: #dc2626;
  background-color: #fef2f2;
}
.callout-important .callout-header { color: #991b1b; }

.callout-warning {
  border-left-color: #d97706;
  background-color: #fffbeb;
}
.callout-warning .callout-header { color: #92400e; }

/* Code Blocks */
.code-block {
  background-color: #0f172a;
  color: #e2e8f0;
  font-family: Consolas, "Courier New", monospace;
  font-size: 7.5pt;
  padding: 8pt 10pt;
  border-radius: 4pt;
  margin: 8pt 0;
  page-break-inside: avoid;
  white-space: pre-wrap;
  word-break: break-all;
}

code {
  font-family: Consolas, "Courier New", monospace;
  background: #f1f5f9;
  color: #0f172a;
  padding: 1pt 3pt;
  border-radius: 2pt;
  font-size: 8.5pt;
}

/* Math */
.math-block {
  background: #f8fafc;
  border: 1pt solid #e2e8f0;
  border-radius: 4pt;
  padding: 6pt 10pt;
  margin: 6pt 0;
  text-align: center;
  font-family: "Cambria Math", "Times New Roman", serif;
  font-size: 10pt;
  font-style: italic;
  color: #0f172a;
  page-break-inside: avoid;
}

.math-inline {
  font-family: "Cambria Math", "Times New Roman", serif;
  font-style: italic;
  color: #0f172a;
}

/* Diagrams */
.mermaid-diagram-card {
  page-break-inside: avoid;
  border: 1pt solid #cbd5e1;
  background: #ffffff;
  border-radius: 6pt;
  padding: 10pt;
  margin: 12pt 0;
  text-align: center;
}

.diagram-caption {
  font-size: 7.5pt;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 6pt;
  letter-spacing: 0.05em;
}

.mermaid-diagram-card svg {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 0 auto;
}
"""

FULL_HTML = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Dokumentasi Arsitektur, PRD, Flow & ERD - Coal Ash Testing LIMS</title>
  <style>
    {CSS_STYLES}
  </style>
</head>
<body>
  <div class="doc-header">
    <div>
      <span class="lab-badge">ISO/IEC 17025 Ready • LIMS Official Specification</span>
      <div style="font-size: 11pt; font-weight: 800; color: #0f172a;">PT MINERAL ANALITIKA LABORATORIUM</div>
      <div style="font-size: 8pt; color: #64748b;">Sistem Pengujian Laboratorium Terakreditasi KAN LP-001-IDN</div>
    </div>
    <div style="text-align: right; font-size: 8pt; color: #475569;">
      <div><strong>Status:</strong> Dokumen Rekayasa Resmi (v1.0)</div>
      <div><strong>Rilis:</strong> Oktober 2026</div>
      <div><strong>Aplikasi:</strong> <code>coal-ash-app</code></div>
    </div>
  </div>

  {body_html}
</body>
</html>
"""

print("4. Menyimpan berkas HTML mandiri:", HTML_PATH)
with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(FULL_HTML)

print("5. Mengekspor HTML ke berkas PDF resmi via Microsoft Edge Headless...")
edge_cmd = [
    EDGE_EXE,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={PDF_PATH}",
    HTML_PATH
]

res = subprocess.run(edge_cmd, capture_output=True, text=True)
if os.path.exists(PDF_PATH):
    size_kb = os.path.getsize(PDF_PATH) / 1024
    print(f"   ✓ Ekspor PDF Berhasil! Ukuran: {size_kb:.1f} KB -> {PDF_PATH}")
    
    # Salin ke Downloads dan Workspace Root
    try:
        shutil.copy2(PDF_PATH, DOWNLOADS_PDF)
        print(f"   ✓ Disalin ke folder Downloads: {DOWNLOADS_PDF}")
    except Exception as e:
        print(f"   [Peringatan] Gagal menyalin ke Downloads: {e}")

    try:
        shutil.copy2(PDF_PATH, WORKSPACE_PDF)
        print(f"   ✓ Disalin ke folder Workspace: {WORKSPACE_PDF}")
    except Exception as e:
        print(f"   [Peringatan] Gagal menyalin ke Workspace: {e}")
else:
    print("   ✕ Gagal menghasilkan PDF. Pesan error Edge:", res.stderr)
