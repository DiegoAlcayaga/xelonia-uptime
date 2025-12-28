/**
 * CMMS App - Core Logic
 */

// --- STATE MANAGEMENT (Simulado) ---
const state = {
    user: { name: "Jefe de Mantenimiento", role: "admin" },
    view: "dashboard", // Vista actual
    equipos: [
        { id: 1, nombre: "Compresor Aire #1", area: "Sala Máquinas", estado: "activo", kpi: 98 },
        { id: 2, nombre: "Chiller Principal", area: "Techo", estado: "alerta", kpi: 85 },
        { id: 3, nombre: "Generador Emergencia", area: "Sótano", estado: "inactivo", kpi: 0 },
        { id: 4, nombre: "Ascensor Servicio", area: "Lobby", estado: "activo", kpi: 99 },
    ]
};

// --- ROUTER & RENDERER ---
const appContainer = document.getElementById('app');

function init() {
    renderLayout();
    navigate('dashboard');
}

function navigate(viewName) {
    state.view = viewName;
    const contentArea = document.getElementById('main-content');
    if (contentArea) {
        contentArea.innerHTML = renderView(viewName);
        attachEvents(viewName);
    }
}

// Layout Principal (Header + Sidebar + Content)
function renderLayout() {
    appContainer.innerHTML = `
        <div class="app-container">
            <!-- Header -->
            <header style="grid-area: header; background: var(--color-surface); display: flex; align-items: center; padding: 0 1rem; border-bottom: 1px solid var(--color-border);">
                <span class="material-symbols-rounded" style="font-size: 32px; color: var(--color-primary); margin-right: 1rem;">build_circle</span>
                <h2 style="flex: 1;">CMMS Hotel 5*</h2>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <span class="material-symbols-rounded">notifications</span>
                    <div style="width: 32px; height: 32px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">JM</div>
                </div>
            </header>

            <!-- Sidebar (Desktop) / Nav (Mobile) -->
            <nav style="grid-area: sidebar; background: var(--color-surface); display: flex; flex-direction: column; padding: 1rem; border-right: 1px solid var(--color-border);" class="sidebar-nav">
                <button onclick="window.navigate('dashboard')" class="btn" style="justify-content: flex-start; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                    <span class="material-symbols-rounded">dashboard</span> Dashboard
                </button>
                <button onclick="window.navigate('activos')" class="btn" style="justify-content: flex-start; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                    <span class="material-symbols-rounded">precision_manufacturing</span> Activos
                </button>
                <button onclick="window.navigate('ots')" class="btn" style="justify-content: flex-start; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                    <span class="material-symbols-rounded">assignment</span> Órdenes (OT)
                </button>
                  <button onclick="window.navigate('reportes')" class="btn" style="justify-content: flex-start; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                    <span class="material-symbols-rounded">picture_as_pdf</span> Reportes
                </button>
            </nav>
            
             <!-- Mobile Nav (Bottom) -->
            <nav style="grid-area: nav; background: var(--color-surface); display: flex; justify-content: space-around; align-items: center; border-top: 1px solid var(--color-border);" class="mobile-nav">
                <div onclick="window.navigate('dashboard')" style="display: flex; flex-direction: column; align-items: center; padding: 0.5rem;">
                    <span class="material-symbols-rounded">dashboard</span>
                    <span style="font-size: 0.7rem;">Inicio</span>
                </div>
                <div onclick="window.navigate('activos')" style="display: flex; flex-direction: column; align-items: center; padding: 0.5rem;">
                    <span class="material-symbols-rounded">precision_manufacturing</span>
                    <span style="font-size: 0.7rem;">Equipos</span>
                </div>
                <div onclick="window.navigate('ots')" style="display: flex; flex-direction: column; align-items: center; padding: 0.5rem;">
                    <span class="material-symbols-rounded">assignment</span>
                    <span style="font-size: 0.7rem;">OTs</span>
                </div>
            </nav>

            <!-- Main Content Area -->
            <main id="main-content" style="grid-area: content; overflow: hidden; position: relative;">
                <!-- Vistas cargadas aquí -->
            </main>
        </div>
    `;

    // Hack para exponer navegación global
    window.navigate = navigate;

    // Ocultar sidebar en móvil (CSS media query lo maneja visualmente, pero aquí ajustamos clases si fuera necesario)
    const style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 768px) { .sidebar-nav { display: none !important; } }
        @media (min-width: 769px) { .mobile-nav { display: none !important; } }
    `;
    document.head.appendChild(style);
}

// --- VIEWS ---

function renderView(viewName) {
    if (viewName === 'dashboard') return renderDashboard();
    if (viewName === 'activos') return renderActivos();
    return `<h1>Vista no encontrada</h1>`;
}

function renderDashboard() {
    const totalEquipos = state.equipos.length;
    const alertas = state.equipos.filter(e => e.estado !== 'activo').length;

    return `
        <div class="view-content">
            <h2 style="margin-bottom: 1rem;">Panel de Control</h2>
            
            <!-- KPI Cards -->
            <div class="dashboard-grid" style="grid-TEMPLATE-columns: repeat(2, 1fr);">
                <div class="card" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                    <div style="font-size: 0.8rem; opacity: 0.9;">Disponibilidad Global</div>
                    <div style="font-size: 2rem; font-weight: bold;">94.5%</div>
                    <div style="font-size: 0.7rem;">▲ 2% vs mes anterior</div>
                </div>
                <div class="card" style="background: ${alertas > 0 ? '#ef4444' : '#10b981'};">
                    <div style="font-size: 0.8rem; opacity: 0.9;">Equipos en Alerta</div>
                    <div style="font-size: 2rem; font-weight: bold;">${alertas}</div>
                    <div style="font-size: 0.7rem;">Requieren atención</div>
                </div>
            </div>

            <h3 style="margin: 1.5rem 0 1rem 0;">Accesos Rápidos</h3>
             <div class="dashboard-grid">
                <button class="card btn" style="flex-direction: column; gap: 0.5rem; height: 100px;">
                    <span class="material-symbols-rounded" style="font-size: 32px; color: var(--color-warning);">add_circle</span>
                    Crear OT
                </button>
                 <button class="card btn" style="flex-direction: column; gap: 0.5rem; height: 100px;">
                    <span class="material-symbols-rounded" style="font-size: 32px; color: var(--color-accent);">qr_code_scanner</span>
                    Escanear QR
                </button>
            </div>

        </div>
    `;
}

function renderActivos() {
    const listHtml = state.equipos.map(eq => {
        let statusColor = eq.estado === 'activo' ? 'var(--color-success)' : (eq.estado === 'alerta' ? 'var(--color-warning)' : 'var(--color-danger)');
        return `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div>
                    <div style="font-weight: 600;">${eq.nombre}</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-muted);">${eq.area}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.8rem; font-weight: bold;">${eq.kpi}%</span>
                    <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColor};"></div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="view-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2>Mis Equipos</h2>
                <button class="btn btn-primary"><span class="material-symbols-rounded">add</span> Nuevo</button>
            </div>
            
            <!-- Filtros (Simulados) -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.5rem;">
                <span style="background: var(--color-primary); padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.8rem;">Todos</span>
                <span style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.8rem;">Críticos</span>
                <span style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.8rem;">En Falla</span>
            </div>

            <div class="equipos-list">
                ${listHtml}
            </div>
        </div>
    `;
}

function attachEvents(viewName) {
    // Aquí agregaríamos listeners específicos para formularios, etc.
}

// Iniciar App
document.addEventListener('DOMContentLoaded', init);
