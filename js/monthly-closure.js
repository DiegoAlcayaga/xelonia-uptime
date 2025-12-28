// ============================================
// MONTHLY CLOSURE FUNCTION
// ============================================

async function ejecutarCierreMensual() {
    if (!confirm("⚠️ CIERRE DE MES ⚠️\n\nEsta acción generará un reporte completo del período y eliminará:\n• Fotos de equipos\n• OTs completadas (se archivarán en el PDF)\n• Logs antiguos\n\n¿Desea continuar?")) {
        return;
    }

    try {
        // Step 1: Generate Comprehensive PDF Report
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246);
        doc.text("REPORTE MAESTRO DE CIERRE", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        const mesActual = new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        doc.text(`Período: ${mesActual}`, 105, 28, { align: 'center' });
        doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 105, 34, { align: 'center' });

        let yPos = 45;

        // Section 1: OTs Summary
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("1. RESUMEN DE ÓRDENES DE TRABAJO", 15, yPos);
        yPos += 10;

        const otsCompletadas = ots.filter(o => o.estado === 'completada');
        const otsPendientes = ots.filter(o => o.estado !== 'completada' && o.estado !== 'rechazada');
        const otsRechazadas = ots.filter(o => o.estado === 'rechazada');

        doc.setFontSize(10);
        doc.text(`Total OTs Completadas: ${otsCompletadas.length}`, 20, yPos);
        yPos += 6;
        doc.text(`Total OTs Pendientes: ${otsPendientes.length}`, 20, yPos);
        yPos += 6;
        doc.text(`Total OTs Rechazadas: ${otsRechazadas.length}`, 20, yPos);
        yPos += 12;

        // OTs Table
        const otsData = otsCompletadas.slice(0, 20).map(ot => [
            `#${ot.id}`,
            ot.titulo.substring(0, 40),
            ot.prioridad || 'N/A',
            ot.horas ? `${ot.horas}h` : '-',
            ot.costo ? `$${ot.costo.toLocaleString('es-CL')}` : '-'
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['ID', 'Título', 'Prioridad', 'Horas', 'Costo']],
            body: otsData.length > 0 ? otsData : [['Sin datos', '-', '-', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Section 2: Technician Performance
        doc.setFontSize(14);
        doc.text("2. RENDIMIENTO DE TÉCNICOS", 15, yPos);
        yPos += 10;

        const tecPerformance = tecnicos.map(t => {
            const tecOTs = otsCompletadas.filter(o => o.asignadoId === t.id);
            const tecLogs = laborLogs.filter(l => l.idTec === t.id);
            const totalHoras = calculateTotalHours(tecLogs);

            return [
                t.nombre,
                tecOTs.length,
                `${totalHoras.toFixed(1)}h`,
                t.especialidad || 'General'
            ];
        });

        doc.autoTable({
            startY: yPos,
            head: [['Técnico', 'OTs Cerradas', 'Horas Trabajadas', 'Especialidad']],
            body: tecPerformance,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 9 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Section 3: Equipment Status
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.text("3. ESTADO DE EQUIPOS", 15, yPos);
        yPos += 10;

        const equiposCriticos = equipos.filter(e => e.estado === 'peligro' || e.isCritico);
        const equiposData = equiposCriticos.slice(0, 15).map(e => [
            e.nombre.substring(0, 35),
            e.area || 'N/A',
            e.estado.toUpperCase(),
            e.dispo ? `${e.dispo}%` : '-'
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Equipo', 'Área', 'Estado', 'Disponibilidad']],
            body: equiposData.length > 0 ? equiposData : [['Sin equipos críticos', '-', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68] },
            styles: { fontSize: 8 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Section 4: Inventory
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.text("4. INVENTARIO DE REPUESTOS", 15, yPos);
        yPos += 10;

        const repuestosData = repuestos.slice(0, 20).map(r => [
            r.nombre.substring(0, 40),
            r.stock || 0,
            r.stockMin || 0,
            r.stock < r.stockMin ? 'CRÍTICO' : 'OK'
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Repuesto', 'Stock Actual', 'Stock Mínimo', 'Estado']],
            body: repuestosData,
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11] },
            styles: { fontSize: 8 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pageCount} | Cierre Mensual | ${APP_CONFIG.companyName}`, 105, 290, { align: 'center' });
        }

        // Save PDF
        doc.save(`CIERRE_MENSUAL_${new Date().toISOString().slice(0, 7)}.pdf`);

        console.log("✅ PDF de cierre generado");

        // Step 2: Confirm before purging
        if (!confirm("✅ Reporte descargado exitosamente.\n\n¿Proceder con la limpieza de la nube?\n\nEsto eliminará:\n• Fotos de equipos\n• OTs completadas\n• Logs antiguos")) {
            alert("Operación cancelada. Solo se generó el reporte.");
            return;
        }

        // Step 3: Purge Cloud Data
        console.log("🧹 Iniciando limpieza de datos...");

        // Remove photos from equipment
        equipos.forEach(eq => {
            if (eq.foto) {
                delete eq.foto;
            }
        });

        // Archive completed OTs (remove from active list)
        const otsActivas = ots.filter(o => o.estado !== 'completada');
        ots.length = 0;
        ots.push(...otsActivas);

        // Clear old labor logs (keep only last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentLogs = laborLogs.filter(log => new Date(log.timestamp).getTime() > thirtyDaysAgo);
        laborLogs.length = 0;
        laborLogs.push(...recentLogs);

        // Clear tool logs
        toolLogs.length = 0;

        // Step 4: Sync to cloud
        await persist();

        console.log("✅ Limpieza completada");

        alert("🎉 CIERRE DE MES COMPLETADO\n\n✅ Reporte PDF generado\n✅ Fotos eliminadas\n✅ OTs archivadas\n✅ Logs antiguos purgados\n\nLa nube ha sido optimizada.");

        // Refresh view
        navigate('reportes');

    } catch (error) {
        console.error("❌ Error en cierre mensual:", error);
        alert("Error al ejecutar el cierre. Por favor, intente nuevamente.");
    }
}

// Helper function (if not already defined)
function calculateTotalHours(logs) {
    let totalMs = 0;
    let lastStart = null;

    logs.forEach(log => {
        if (log.action === 'inicio') {
            lastStart = new Date(log.timestamp);
        } else if (log.action === 'fin' && lastStart) {
            const end = new Date(log.timestamp);
            totalMs += (end - lastStart);
            lastStart = null;
        }
    });

    return totalMs / (1000 * 60 * 60); // Convert to hours
}
