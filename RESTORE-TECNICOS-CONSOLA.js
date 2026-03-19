// EJECUTA ESTO EN LA CONSOLA DEL NAVEGADOR (Ctrl+C, Ctrl+V, Enter)

const tecnicos = [
    {
        id: 1,
        nombre: "Supervisor",
        iniciales: "AD",
        rol: "admin",
        password: "1234",
        cargo: "ADMINISTRADOR",
        color: "#f59e0b",
        activo: true,
        skills: []
    },
    {
        id: 2,
        nombre: "Juan Pérez",
        iniciales: "JP",
        rol: "tecnico",
        password: "1234",
        cargo: "Carlos",
        color: "#3b82f6",
        activo: true,
        skills: []
    },
    {
        id: 3,
        nombre: "Técnico 3",
        iniciales: "T3",
        rol: "tecnico",
        password: "1234",
        cargo: "Técnico",
        color: "#10b981",
        activo: true,
        skills: []
    }
];

localStorage.setItem('cmms_tecnicos', JSON.stringify(tecnicos));
window.tecnicos = tecnicos;
console.log("✅ 3 técnicos restaurados localmente");
location.reload();
