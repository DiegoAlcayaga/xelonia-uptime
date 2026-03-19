# Leer el archivo línea por línea
$lines = Get-Content "index.html"
$output = @()
$inFunction = $false
$lineNum = 0

foreach ($line in $lines) {
    $lineNum++
    
    # Detectar inicio de la función safeLoad
    if ($line -match '^\s+function safeLoad\(key, defaultValue\)') {
        $inFunction = $true
        # Agregar la nueva función completa
        $output += "        function safeLoad(key, defaultValue) {"
        $output += "            const stored = localStorage.getItem(key);"
        $output += "            "
        $output += "            // Si hay datos guardados, devolverlos SIEMPRE"
        $output += "            if (stored !== null && stored !== undefined) {"
        $output += "                try {"
        $output += "                    const parsed = JSON.parse(stored);"
        $output += "                    console.log(`[SafeLoad] ✅ `"`${key}`" cargado:`, Array.isArray(parsed) ? `Array[`${parsed.length}`]` : typeof parsed);"
        $output += "                    return parsed;"
        $output += "                } catch (e) {"
        $output += "                    console.error(`[SafeLoad] ❌ Error parseando `"`${key}`":`, e);"
        $output += "                }"
        $output += "            }"
        $output += "            "
        $output += "            // Si NO hay datos guardados, devolver array/objeto vacío"
        $output += "            console.log(`[SafeLoad] ⚠️ `"`${key}`" no existe en localStorage. Devolviendo vacío.`);"
        $output += "            if (Array.isArray(defaultValue)) return [];"
        $output += "            if (typeof defaultValue === 'object' && defaultValue !== null) return {};"
        $output += "            return null;"
        $output += "        }"
        continue
    }
    
    # Detectar fin de la función safeLoad
    if ($inFunction -and $line -match '^\s+\}$' -and $lineNum -gt 2830) {
        $inFunction = $false
        continue
    }
    
    # Si no estamos dentro de la función, agregar la línea
    if (-not $inFunction) {
        $output += $line
    }
}

# Guardar el archivo
$output | Set-Content "index.html" -Encoding UTF8
Write-Host "✅ Función safeLoad reemplazada exitosamente"
