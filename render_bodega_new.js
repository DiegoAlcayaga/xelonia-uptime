// NUEVA VERSIÓN DE renderBodega() con tabs y vista por encargado
function renderBodega() {
    // KPIs de Bodega
    const valorTotal = repuestos.reduce((sum, r) => sum + (r.stock * r.precio), 0);
    const stockCritico = repuestos.filter(r => r.stock <= (r.stockMinimo || r.critico));
    const repuestosPendientes = repuestos.filter(r => r.estadoAprobacion === 'pendiente');
    const repuestosAprobados = repuestos.filter(r => r.estadoAprobacion === 'aprobado' || !r.estadoAprobacion);
    
    const fmt = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
    const isAdmin = currentRole === 'admin';
    const isTecnico = currentRole === 'tecnico';

    // Agrupar por encargados
    const encargados = window.tecnicos.filter(t => t.categoriaEncargado);
    const repuestosPorEncargado = {};
    
    encargados.forEach(enc => {
        const categoria = enc.categoriaEncargado;
        const repuestosCategoria = repuestos.filter(r => r.categoria === categoria);
        const totalPendientes = repuestosCategoria.filter(r => r.estadoAprobacion === 'pendiente').length;
        const catInfo = window.categoriasBodega.find(c => c.nombre === categoria);
        
        repuestosPorEncargado[enc.id] = {
            tecnico: enc,
            categoria: categoria,
            catInfo: catInfo || { icono: '📦', color: '#3b82f6' },
            repuestos: repuestosCategoria,
            totalItems: repuestosCategoria.length,
            pendientes: totalPendientes,
            valorTotal: repuestosCategoria.reduce((sum, r) => sum + (r.stock * r.precio), 0)
        };
    });

    return `
        <div class="view-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 10px;">
                <h3>📦 ${isTecnico ? 'Localizador de Repuestos' : 'Gestión de Bodega'}</h3>
                <div style="display: flex; gap: 10px;">
                    ${!isTecnico ? `
                        ${isAdmin && repuestosPendientes.length > 0 ? `
                        <button onclick="revisarPendientes()" class="btn" style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4);">
                            <span class="material-symbols-rounded">pending_actions</span>
                            Revisar Pendientes (${repuestosPendientes.length})
                        </button>
                        ` : ''}
                        <button onclick="abrirModalCategoria()" class="btn">
                            <span class="material-symbols-rounded">category</span>
                            Gestionar Categorías
                        </button>
                        <button onclick="abrirModalNuevoRepuesto()" class="btn btn-primary">
                            <span class="material-symbols-rounded">add</span>
                            Agregar Repuesto
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- KPIs -->
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
                ${!isTecnico ? `
                <div class="card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1)); border: 1px solid rgba(59, 130, 246, 0.2);">
                    <div style="font-size: 0.65rem; color: var(--color-primary); font-weight: 800; text-transform: uppercase;">Valorización Total</div>
                    <div style="font-size: 1.6rem; font-weight: 900; margin-top: 8px;">${fmt.format(valorTotal)}</div>
                </div>
                ` : ''}
                <div class="card" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1)); border: 1px solid rgba(239, 68, 68, 0.2);">
                    <div style="font-size: 0.65rem; color: var(--color-danger); font-weight: 800; text-transform: uppercase;">Stock Crítico</div>
                    <div style="font-size: 1.6rem; font-weight: 900; margin-top: 8px; color: var(--color-danger);">${stockCritico.length}</div>
                </div>
                <div class="card" style="background: rgba(255, 255, 255, 0.03);">
                    <div style="font-size: 0.65rem; color: var(--color-text-muted); font-weight: 800; text-transform: uppercase;">Total Items</div>
                    <div style="font-size: 1.6rem; font-weight: 900; margin-top: 8px;">${repuestosAprobados.length}</div>
                    <div style="font-size: 0.6rem; color: var(--color-text-muted); margin-top: 4px;">Aprobados</div>
                </div>
                ${isAdmin && repuestosPendientes.length > 0 ? `
                <div class="card" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3);">
                    <div style="font-size: 0.65rem; color: #f59e0b; font-weight: 800; text-transform: uppercase;">Pendientes</div>
                    <div style="font-size: 1.6rem; font-weight: 900; margin-top: 8px; color: #f59e0b;">${repuestosPendientes.length}</div>
                    <div style="font-size: 0.6rem; color: var(--color-text-muted); margin-top: 4px;">Requieren aprobación</div>
                </div>
                ` : ''}
            </div>

            <!-- Tabs -->
            <div style="margin: 20px 0; border-bottom: 2px solid rgba(255,255,255,0.1);">
                <div style="display: flex; gap: 20px;">
                    <button id="tab-categorias" class="tab-btn active" onclick="cambiarTabBodega('categorias')">
                        Por Categoría
                    </button>
                    <button id="tab-encargados" class="tab-btn" onclick="cambiarTabBodega('encargados')">
                        Por Encargado
                    </button>
                </div>
            </div>

            <!-- Contenido Tab: Por Categoría -->
            <div id="content-categorias" class="tab-content active">
                ${window.categoriasBodega.map(cat => {
                    const repuestosCategoria = repuestos.filter(r => r.categoria === cat.nombre);
                    if (repuestosCategoria.length === 0) return '';
                    
                    const pendientes = repuestosCategoria.filter(r => r.estadoAprobacion === 'pendiente').length;
                    const encargado = encargados.find(enc => enc.categoriaEncargado === cat.nombre);
                    
                    return `
                        <div class="card" style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="font-size: 2rem;">${cat.icono}</div>
                                    <div>
                                        <div style="font-weight: 800; font-size: 0.95rem;">${cat.nombre}</div>
                                        <div style="font-size: 0.65rem; color: var(--color-text-muted);">
                                            ${encargado ? `Encargado: ${encargado.nombre}` : 'Sin encargado'}
                                            ${pendientes > 0 ? ` • <span style="color: #f59e0b;">${pendientes} pendiente(s)</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.3rem; font-weight: 900; color: ${cat.color};">${repuestosCategoria.length}</div>
                                    <div style="font-size: 0.6rem; color: var(--color-text-muted);">Items</div>
                                </div>
                            </div>
                            
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${repuestosCategoria.map(r => `
                                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.75rem; align-items: center;">
                                        <div>
                                            <div style="font-weight: 700;">${r.nombre}</div>
                                            <div style="font-size: 0.65rem; color: var(--color-text-muted);">
                                                📍 ${r.zona || 'Sin ubicar'}
                                                ${r.estadoAprobacion === 'pendiente' ? '<span style="color: #f59e0b; font-weight: 800;"> • PENDIENTE</span>' : ''}
                                            </div>
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-weight: 900; font-size: 1rem; color: ${r.stock <= (r.stockMinimo || r.critico) ? 'var(--color-danger)' : 'var(--color-success)'};">${r.stock}</div>
                                            <div style="font-size: 0.6rem; color: var(--color-text-muted);">Stock</div>
                                        </div>
                                        <div style="text-align: center;">
                                            <div style="font-weight: 700;">${r.stockMinimo || r.critico}</div>
                                            <div style="font-size: 0.6rem; color: var(--color-text-muted);">Mínimo</div>
                                        </div>
                                        ${!isTecnico ? `
                                        <div style="text-align: right;">
                                            <div style="font-weight: 700;">${fmt.format(r.precio)}</div>
                                            <div style="font-size: 0.6rem; color: var(--color-text-muted);">Precio</div>
                                        </div>
                                        ` : '<div></div>'}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Contenido Tab: Por Encargado -->
            <div id="content-encargados" class="tab-content" style="display: none;">
                <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                    ${Object.values(repuestosPorEncargado).map(data => `
                        <div class="card" style="background: linear-gradient(135deg, ${data.catInfo.color}15, ${data.catInfo.color}05); border: 1px solid ${data.catInfo.color}30;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                                <div style="font-size: 2.5rem;">${data.catInfo.icono}</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 800; font-size: 0.9rem;">${data.tecnico.nombre}</div>
                                    <div style="font-size: 0.7rem; color: var(--color-text-muted);">Encargado de ${data.categoria}</div>
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
                                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; text-align: center;">
                                    <div style="font-size: 1.4rem; font-weight: 900;">${data.totalItems}</div>
                                    <div style="font-size: 0.6rem; color: var(--color-text-muted);">Total Items</div>
                                </div>
                                ${data.pendientes > 0 ? `
                                <div style="background: rgba(245, 158, 11, 0.2); padding: 10px; border-radius: 6px; text-align: center;">
                                    <div style="font-size: 1.4rem; font-weight: 900; color: #f59e0b;">${data.pendientes}</div>
                                    <div style="font-size: 0.6rem; color: var(--color-text-muted);">Pendientes</div>
                                </div>
                                ` : `
                                <div style="background: rgba(16, 185, 129, 0.2); padding: 10px; border-radius: 6px; text-align: center;">
                                    <div style="font-size: 1.4rem; font-weight: 900; color: var(--color-success);">✓</div>
                                    <div style="font-size: 0.6rem; color: var(--color-text-muted);">Todo Aprobado</div>
                                </div>
                                `}
                            </div>
                            
                            ${!isTecnico ? `
                            <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 0.65rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 800;">Valorización</div>
                                <div style="font-size: 1.1rem; font-weight: 900; color: ${data.catInfo.color}; margin-top: 4px;">${fmt.format(data.valorTotal)}</div>
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}
