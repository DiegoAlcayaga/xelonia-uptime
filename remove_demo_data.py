# Eliminar TODOS los datos de demo del archivo
import re

with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Eliminar defaultEquipos
content = re.sub(
    r'const defaultEquipos = \[[\s\S]*?\];',
    'const defaultEquipos = [];  // ❌ Eliminado - App limpia',
    content,
    count=1
)

# Eliminar defaultTecnicos
content = re.sub(
    r'const defaultTecnicos = \[[\s\S]*?\];',
    'const defaultTecnicos = [];  // ❌ Eliminado - App limpia',
    content,
    count=1
)

# Eliminar defaultRepuestos
content = re.sub(
    r'const defaultRepuestos = \[[\s\S]*?\];',
    'const defaultRepuestos = [];  // ❌ Eliminado - App limpia',
    content,
    count=1
)

# Eliminar defaultHerramientas
content = re.sub(
    r'const defaultHerramientas = \[[\s\S]*?\];',
    'const defaultHerramientas = [];  // ❌ Eliminado - App limpia',
    content,
    count=1
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Todos los datos de demo eliminados")
