"""
DocBuilder module for generating professional Vietnamese academic reports in docx format.
"""
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# Color palette
COLOR_PRIMARY = RGBColor(27, 54, 93)     # Deep Navy (#1B365D)
COLOR_SECONDARY = RGBColor(43, 108, 176) # Steel Blue (#2B6CB0)
COLOR_TEXT = RGBColor(45, 55, 72)        # Charcoal (#2D3748)
COLOR_MUTED = RGBColor(113, 128, 150)    # Gray (#718096)
HEX_PRIMARY = "1B365D"
HEX_SECONDARY = "2B6CB0"
HEX_LIGHT_BG = "F7FAFC"
HEX_BORDER = "CBD5E0"
HEX_CALLOUT_BG = "EBF8FF"
HEX_CODE_BG = "F8F9FA"

def create_base_document():
    doc = Document()
    
    # Page setup: A4, standard thesis margins (Top: 2cm, Bottom: 2cm, Left: 2.5cm, Right: 2cm)
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(0.79)     # 2.0 cm
        section.bottom_margin = Inches(0.79)  # 2.0 cm
        section.left_margin = Inches(0.98)    # 2.5 cm
        section.right_margin = Inches(0.79)   # 2.0 cm
        
        # Header & Footer setup
        header = section.header
        p_hdr = header.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_hdr = p_hdr.add_run("Báo cáo Đồ án PTTKHTTT - Đề tài 20: Hệ thống Bán hàng thông minh (SmartTech Store)")
        r_hdr.font.name = "Times New Roman"
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = COLOR_MUTED
        r_hdr.font.italic = True
        
        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr = p_ftr.add_run("Trang ")
        r_ftr.font.name = "Times New Roman"
        r_ftr.font.size = Pt(9)
        r_ftr.font.color.rgb = COLOR_MUTED
        # Add page number field to footer
        add_page_number(r_ftr)
        
    return doc

def add_page_number(run):
    fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
    run._r.append(fldSimple)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E0", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}><w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/><w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/><w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/><w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/><w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/><w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/></w:tblBorders>')
    tblPr.append(borders)

def add_title(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(18)
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(22)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY
    return p

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(13.5)
    run.font.bold = True
    run.font.color.rgb = COLOR_SECONDARY
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = COLOR_TEXT
    return p

def add_p(doc, text="", bold=False, italic=False, space_after=6, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.line_spacing = 1.2
    p.paragraph_format.space_after = Pt(space_after)
    if text:
        run = p.add_run(text)
        run.font.name = "Times New Roman"
        run.font.size = Pt(11)
        run.font.color.rgb = COLOR_TEXT
        run.font.bold = bold
        run.font.italic = italic
    return p

def add_bullet(doc, text, bold_prefix="", space_after=4):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(space_after)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Times New Roman"
        r_pre.font.size = Pt(11)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_TEXT
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(11)
    run.font.color.rgb = COLOR_TEXT
    return p

def add_callout(doc, text, title="ĐIỂM NỔI BẬT / THIẾT KẾ THÔNG MINH"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.5)
    set_cell_background(cell, HEX_CALLOUT_BG)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border thick, others none
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="24" w:space="0" w:color="{HEX_SECONDARY}"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    r_title = p.add_run(f"★ {title}\n")
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(10.5)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_SECONDARY
    
    r_text = p.add_run(text)
    r_text.font.name = "Times New Roman"
    r_text.font.size = Pt(10)
    r_text.font.italic = True
    r_text.font.color.rgb = COLOR_TEXT
    
    add_p(doc, "", space_after=4)

def add_code_block(doc, code_text, caption=""):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.5)
    set_cell_background(cell, HEX_CODE_BG)
    set_cell_margins(cell, top=100, bottom=100, left=160, right=160)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:left w:val="single" w:sz="12" w:space="0" w:color="{HEX_PRIMARY}"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/><w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_text.strip())
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(3)
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run(f"Hình: {caption}")
        r_cap.font.name = "Times New Roman"
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.bold = True
        r_cap.font.color.rgb = COLOR_MUTED
    else:
        add_p(doc, "", space_after=4)

def create_styled_table(doc, headers, data, col_widths=None, caption=""):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    
    # Header row
    hdr_row = table.rows[0]
    for idx, header_text in enumerate(headers):
        cell = hdr_row.cells[idx]
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=140, bottom=140, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(header_text)
        run.font.name = "Times New Roman"
        run.font.size = Pt(10)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        if col_widths and idx < len(col_widths):
            cell.width = Inches(col_widths[idx])
            
    # Data rows
    for r_idx, row_data in enumerate(data):
        row = table.rows[r_idx + 1]
        bg_color = HEX_LIGHT_BG if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, cell_value in enumerate(row_data):
            cell = row.cells[c_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(0)
            
            # Align center for index / short codes, left for text
            if len(cell_value) <= 10 and not any(w in cell_value for w in [" ", "\n"]):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            run = p.add_run(str(cell_value))
            run.font.name = "Times New Roman"
            run.font.size = Pt(9.5)
            run.font.color.rgb = COLOR_TEXT
            if col_widths and c_idx < len(col_widths):
                cell.width = Inches(col_widths[c_idx])
                
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(4)
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run(f"Bảng: {caption}")
        r_cap.font.name = "Times New Roman"
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.bold = True
        r_cap.font.color.rgb = COLOR_MUTED
    else:
        add_p(doc, "", space_after=6)

def add_use_case_spec_table(doc, spec_dict):
    """
    Creates a standardized Use Case specification table matching the project template:
    | Use Case | ? |
    | Actor | ? |
    | Brief Description | ? |
    | Pre-Conditions | ? |
    | Basic Flows | ? |
    | Alternative Flows | ? |
    | Post-Conditions | ? |
    | Special Requirements | ? |
    """
    fields = [
        ("Use Case", spec_dict.get("Use Case", "")),
        ("Actor", spec_dict.get("Actor", "")),
        ("Brief Description", spec_dict.get("Brief Description", "")),
        ("Pre-Conditions", spec_dict.get("Pre-Conditions", "")),
        ("Basic Flows", spec_dict.get("Basic Flows", "")),
        ("Alternative Flows", spec_dict.get("Alternative Flows", "")),
        ("Post-Conditions", spec_dict.get("Post-Conditions", "")),
        ("Special Requirements", spec_dict.get("Special Requirements", ""))
    ]
    
    table = doc.add_table(rows=len(fields), cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    
    col_widths = [1.8, 4.7]
    
    for idx, (label, val) in enumerate(fields):
        row = table.rows[idx]
        cell_lbl = row.cells[0]
        cell_val = row.cells[1]
        
        cell_lbl.width = Inches(col_widths[0])
        cell_val.width = Inches(col_widths[1])
        
        set_cell_background(cell_lbl, "EDF2F7")
        set_cell_margins(cell_lbl, top=100, bottom=100, left=140, right=140)
        p_lbl = cell_lbl.paragraphs[0]
        p_lbl.paragraph_format.space_after = Pt(0)
        p_lbl.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r_lbl = p_lbl.add_run(label)
        r_lbl.font.name = "Times New Roman"
        r_lbl.font.size = Pt(10)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = COLOR_PRIMARY
        
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_val, top=100, bottom=100, left=140, right=140)
        p_val = cell_val.paragraphs[0]
        p_val.paragraph_format.line_spacing = 1.15
        p_val.paragraph_format.space_after = Pt(0)
        p_val.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_val = p_val.add_run(val)
        r_val.font.name = "Times New Roman"
        r_val.font.size = Pt(9.5)
        r_val.font.color.rgb = COLOR_TEXT
        
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(4)
    p_cap.paragraph_format.space_after = Pt(8)
    r_cap = p_cap.add_run(f"Bảng đặc tả ca sử dụng: {spec_dict.get('Use Case', '')}")
    r_cap.font.name = "Times New Roman"
    r_cap.font.size = Pt(9.5)
    r_cap.font.italic = True
    r_cap.font.bold = True
    r_cap.font.color.rgb = COLOR_MUTED
