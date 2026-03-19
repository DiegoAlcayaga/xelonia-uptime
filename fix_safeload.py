import re

# Leer el archivo
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Función nueva simplificada
new_function = '''        function safeLoad(key, defaultValue) {
            const stored = localStorage.getItem(key);
            
            // Si hay datos guardados, devolverlos SIEMPRE
            if (stored !== null && stored !== undefined) {
                try {
                    const parsed = JSON.parse(stored);
                    console.log(`[SafeLoad] ✅ "${key}" cargado:`, Array.isArray(parsed) ? `Array[${parsed.length}]` : typeof parsed);
                    return parsed;
                } catch (e) {
                    console.error(`[SafeLoad] ❌ Error parseando "${key}":`, e);
                }
            }
            
            // Si NO hay datos guardados, devolver array/objeto vacío
            console.log(`[SafeLoad] ⚠️ "${key}" no existe en localStorage. Devolviendo vacío.`);
            if (Array.isArray(defaultValue)) return [];
            if (typeof defaultValue === 'object' && defaultValue !== null) return {};
            return null;
        }'''

# Buscar y reemplazar la función safeLoad
# Patrón que captura toda la función desde "function safeLoad" hasta su cierre
pattern = r'function safeLoad\(key, defaultValue\) \{[^}]*(?:\{[^}]*\}[^}]*)*\}'

# Hacer el reemplazo
new_content = re.sub(pattern, new_function, content, count=1, flags=re.DOTALL)

# Guardar el archivo
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Función safeLoad reemplazada exitosamente")
