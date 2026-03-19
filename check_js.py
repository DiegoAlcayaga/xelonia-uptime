import sys

def check_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    in_script = False
    script_content = ""
    start_line = 0
    
    for i, line in enumerate(lines):
        if "<script>" in line and not "src=" in line:
            in_script = True
            script_content = ""
            start_line = i + 1
        elif "</script>" in line and in_script:
            in_script = False
            # Try to compile the script content as if it were valid JS (basic check)
            # Since we are in Python, we can at least check brace balance
            stack = []
            for char_idx, char in enumerate(script_content):
                if char == '{': stack.append(('{', char_idx))
                elif char == '}':
                    if not stack:
                        print(f"Error: Unmatched '}}' in script block starting at line {start_line}")
                        # Find the line in the original file
                        count = 0
                        for j, l in enumerate(lines[start_line-1:]):
                            count += len(l)
                            if count > char_idx:
                                print(f"Likely near line {start_line + j}")
                                break
                    else:
                        stack.pop()
            if stack:
                print(f"Error: {len(stack)} Unmatched '{{' in script block starting at line {start_line}")
                # Show where the first unmatched { is
                first_open = stack[0][1]
                count = 0
                for j, l in enumerate(lines[start_line-1:]):
                    count += len(l)
                    if count > first_open:
                        print(f"First unmatched '{{' likely near line {start_line + j}")
                        break

if __name__ == "__main__":
    check_syntax(sys.argv[1])
