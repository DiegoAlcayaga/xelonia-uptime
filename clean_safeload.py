# Limpiar archivo corrupto - eliminar líneas 2849-2876
with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Eliminar líneas corruptas (2849-2876 son índices 2848-2875)
clean_lines = lines[:2848] + lines[2876:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print(f"✅ Eliminadas {2876-2848} líneas corruptas")
print(f"Total líneas ahora: {len(clean_lines)}")
