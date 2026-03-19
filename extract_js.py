import sys
import re

def extract_and_check(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
    
    with open('temp_check.js', 'w', encoding='utf-8') as f:
        for i, s in enumerate(scripts):
            f.write(f"// --- Script Block {i} ---\n")
            f.write(s)
            f.write("\n")

if __name__ == "__main__":
    extract_and_check(sys.argv[1])
