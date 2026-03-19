
import re
import html

input_file = "view-source_https___xelonia-uptime-app.web.app.html"
output_file = "index_restored_from_web.html"

try:
    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()

    # The format is <td class="line-content">CODE</td>
    # Note: CODE may contain more HTML spans for highlighting (e.g. <span class="html-tag">)
    # So we need to strip ALL tags inside that TD and then unescape HTML entities.
    
    lines = []
    # Find all line content blocks
    matches = re.finditer(r'<td class="line-content">(.*?)</td>', content, re.DOTALL)
    
    for match in matches:
        line_html = match.group(1)
        # Remove all HTML tags from the line (e.g. <span ...>)
        clean_line = re.sub(r'<[^>]*>', '', line_html)
        # Unescape entities (&lt; -> <)
        raw_line = html.unescape(clean_line)
        lines.append(raw_line)
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
        
    print(f"✅ Extrapolated {len(lines)} lines to {output_file}")

except Exception as e:
    print(f"❌ Error: {e}")
