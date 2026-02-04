const fondo = document.getElementById("fondo");

/* ===== Corazones SVG flotantes ===== */
if (fondo) {
    for (let i = 0; i < 25; i++) {
        const svgNS = "http://www.w3.org/2000/svg";
        const heart = document.createElementNS(svgNS, "svg");
        heart.setAttribute("viewBox", "0 0 32 29.6");
        heart.classList.add("corazon");

        const size = Math.random() * 20 + 25;
        heart.style.width = size + "px";
        heart.style.height = size + "px";
        heart.style.left = Math.random() * window.innerWidth + "px";
        heart.style.animationDuration = (Math.random() * 10 + 10) + "s";

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute(
            "d",
            "M23.6,0C20.4,0,17.7,1.8,16,4.4C14.3,1.8,11.6,0,8.4,0C3.7,0,0,3.7,0,8.4C0,14.6,16,29.6,16,29.6S32,14.6,32,8.4C32,3.7,28.3,0,23.6,0Z"
        );
        path.setAttribute("fill", "#ff5f8a");

        heart.appendChild(path);
        fondo.appendChild(heart);
    }
}

/* ===== Imágenes flotantes PNG ===== */
const imgSources = ["GR.png", "bunny.png", "suki.png"]; // añade aquí todas las imágenes
const maxImgs = 2; // cantidad total de imágenes por cada tipo

imgSources.forEach(src => {
    for (let i = 0; i < maxImgs; i++) {
        const img = document.createElement("img");
        img.src = src;
        img.classList.add("floating-img");

        img.style.left = Math.random() * window.innerWidth + "px";
        img.style.top = Math.random() * window.innerHeight + "px";

        const size = Math.random() * 30 + 40;
        img.style.width = size + "px";
        img.style.height = "auto";

        img.style.animationDuration = (Math.random() * 5 + 8) + "s";
        img.style.animationDelay = (Math.random() * 5) + "s";

        fondo.appendChild(img);
    }
});

/* ===== Días especiales ===== */
const diasEneroEspeciales = {
    8: "#0066ff",
    10: "#ff0000",
    21: "#ffd700"
};

/* ===== Popup ===== */
const popup = document.getElementById("popupNota");
const textoNota = document.getElementById("textoNota");
const btnGuardar = document.getElementById("guardarNota");
const btnCerrar = document.getElementById("cerrarPopup");
let diaActual = null;

function abrirPopup(mes, dia) {
    diaActual = { mes, dia };
    textoNota.value = localStorage.getItem(`${mes}_dia_${dia}`) || "";
    popup.style.display = "flex";
}

btnCerrar.onclick = () => popup.style.display = "none";

btnGuardar.onclick = () => {
    const clave = `${diaActual.mes}_dia_${diaActual.dia}`;
    const texto = textoNota.value.trim();
    if (texto === "") localStorage.removeItem(clave);
    else localStorage.setItem(clave, texto);
    popup.style.display = "none";
    generarCalendarios();
};

/* ===== Corazón morado dinámico ===== */
function tieneCorazonMorado(mes, dia) {
    return localStorage.getItem(`${mes}_corazon_${dia}`) === "true";
}

function toggleCorazonMorado(mes, dia) {
    const clave = `${mes}_corazon_${dia}`;
    if (localStorage.getItem(clave)) localStorage.removeItem(clave);
    else localStorage.setItem(clave, "true");
    generarCalendarios();
}

/* ===== Calendario ===== */
function generarCalendario(id, diasMes, primerDia, diasEspeciales = {}) {
    const tbody = document.getElementById(id);
    let html = "<tr>";

    for (let i = 0; i < primerDia; i++) html += "<td></td>";

    for (let dia = 1; dia <= diasMes; dia++) {
        const nota = localStorage.getItem(`${id}_dia_${dia}`);
        const colorEspecial = diasEspeciales[dia];
        const corazonMorado = tieneCorazonMorado(id, dia);

        let contenido = `
        <div class="dia"
             onclick="abrirPopup('${id}', ${dia})"
             oncontextmenu="event.preventDefault(); toggleCorazonMorado('${id}', ${dia});">
        `;

        if (colorEspecial) {
            contenido += `<span class="corazon-dia" style="color:${colorEspecial};opacity:0.35">❤</span>`;
        }

        if (corazonMorado) {
            contenido += `<span class="corazon-dia" style="color:#8000ff">❤</span>`;
        }

        contenido += `<span class="numero-dia">${dia}</span>`;

        if (nota) contenido += `<span class="nota-icono">💬</span>`;

        contenido += "</div>";

        html += `<td>${contenido}</td>`;

        if ((dia + primerDia) % 7 === 0) html += "</tr><tr>";
    }

    html += "</tr>";
    tbody.innerHTML = html;
}

function generarCalendarios() {
    generarCalendario("enero", 31, 3, diasEneroEspeciales);
    generarCalendario("febrero", 28, 6);
}

generarCalendarios();
