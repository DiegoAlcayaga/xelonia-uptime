import sys

def check_syntax_v2(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    in_script = False
    content = ""
    start_line = 0
    
    # Extract the main script block
    for i, line in enumerate(lines):
        if "<script>" in line and i > 2000: # Main block starts at 2669
            in_script = True
            start_line = i + 1
            content = ""
            continue
        if "</script>" in line and in_script:
            in_script = False
            validate_js(content, start_line, lines)
            break
        if in_script:
            content += line

def validate_js(js_code, start_line, all_lines):
    # Stack for braces, parens, brackets
    stack = []
    # Quote state
    in_quote = None # ' " or `
    escaped = False
    
    for i, char in enumerate(js_code):
        if escaped:
            escaped = False
            continue
        if char == '\\':
            escaped = True
            continue
            
        if in_quote:
            if char == in_quote:
                # Close quote
                in_quote = None
            elif in_quote == '`' and char == '$' and i+1 < len(js_code) and js_code[i+1] == '{':
                # Nested expr in template literal
                stack.append(('${', i, find_line(i, all_lines, start_line)))
            continue
        
        if char in ["'", '"', '`']:
            in_quote = char
            continue
            
        if char == '{': stack.append(('{', i, find_line(i, all_lines, start_line)))
        elif char == '}':
            if not stack:
                print(f"Error: Unmatched '}}' near line {find_line(i, all_lines, start_line)}")
            else:
                opening, _, _ = stack.pop()
                if opening == '${':
                    # We closed a template expr
                    pass 
                elif opening != '{':
                    print(f"Error: Mismatched '}}' closing '{opening}' near line {find_line(i, all_lines, start_line)}")
        
        elif char == '(': stack.append(('(', i, find_line(i, all_lines, start_line)))
        elif char == ')':
            if not stack: print(f"Error: Unmatched ')' near line {find_line(i, all_lines, start_line)}")
            else:
                opening, _, _ = stack.pop()
                if opening != '(': print(f"Error: Mismatched ')' closing '{opening}' near line {find_line(i, all_lines, start_line)}")
        
        elif char == '[': stack.append(('[', i, find_line(i, all_lines, start_line)))
        elif char == ']':
            if not stack: print(f"Error: Unmatched ']' near line {find_line(i, all_lines, start_line)}")
            else:
                opening, _, _ = stack.pop()
                if opening != '[': print(f"Error: Mismatched ']' closing '{opening}' near line {find_line(i, all_lines, start_line)}")

    if in_quote:
        print(f"Error: Unclosed quote {in_quote} starting in some line")
    
    for op, pos, line in stack:
        print(f"Error: Unclosed '{op}' from line {line}")

def find_line(char_pos, all_lines, start_line):
    current_pos = 0
    for j, l in enumerate(all_lines[start_line-1:]):
        current_pos += len(l)
        if current_pos > char_pos:
            return start_line + j
    return -1

if __name__ == "__main__":
    check_syntax_v2(sys.argv[1])
