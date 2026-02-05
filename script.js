/* ===== Firebase ===== */
const firebaseConfig = {
  apiKey: "AIzaSyCrbTzyqh7AbCCJdNJwxzhZ-U8js2_2suA",
  authDomain: "sanva-jm.firebaseapp.com",
  projectId: "sanva-jm",
  storageBucket: "sanva-jm.firebasestorage.app",
  messagingSenderId: "44847411302",
  appId: "1:44847411302:web:3356d2251f2ced82f1fda7"
};
/* ===== Imágenes flotantes PNG ===== */
const imgSources = ["GR.png", "bunny.png", "suki.png"]; // añade aquí todas las imágenes
const maxImgs = 2; // cantidad total de imágenes por cada tipo

const USUARIOS_PERMITIDOS = [
  "jmmunoz2k@gmail.com",
  "josemanu15cat@gmail.com"
];

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function getDiaRef(mes, dia) {
    return db.collection("calendario").doc(`${mes}_${dia}`);
}

/* ===== Meses ===== */
const diasEneroEspeciales = { 8:"#0066ff", 10:"#ff0000", 21:"#ffd700" };

const meses = [
    { id:"enero", nombre:"Enero", dias:31, primerDia:3, especiales:diasEneroEspeciales },
    { id:"febrero", nombre:"Febrero", dias:28, primerDia:6, especiales:{} }
];

let mesIndex = 0;

/* ===== Login ===== */
const btnLogin = document.getElementById("loginGoogle");
const btnLogout = document.getElementById("logout");
const app = document.getElementById("app");
const leyenda = document.getElementById("leyenda");

btnLogin.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
};

btnLogout.onclick = () => auth.signOut();

auth.onAuthStateChanged(async user => {
    if (!user) {
        btnLogin.style.display = "inline-block";
        btnLogout.style.display = "none";
        app.style.display = "none";
        leyenda.style.display = "none";
        return;
    }

    if (!USUARIOS_PERMITIDOS.includes(user.email)) {
        alert("No tienes acceso 💔");
        auth.signOut();
        return;
    }

    btnLogin.style.display = "none";
    btnLogout.style.display = "inline-block";
    app.style.display = "block";
    leyenda.style.display = "block";

    await mostrarMes();
});

/* ===== Calendario ===== */
async function generarCalendario(mes) {
    const tbody = document.getElementById(mes.id);
    let html = "<tr>";

    for (let i = 0; i < mes.primerDia; i++) html += "<td></td>";

    for (let dia = 1; dia <= mes.dias; dia++) {
        const doc = await getDiaRef(mes.id, dia).get();
        const data = doc.exists ? doc.data() : {};

        html += `<td>
            <div class="dia" onclick="abrirPopup('${mes.id}', ${dia})">
                ${mes.especiales[dia] ? `<span class="corazon-dia" style="color:${mes.especiales[dia]};opacity:.35">❤</span>` : ""}
                ${data.corazonMorado ? `<span class="corazon-dia" style="color:#8000ff">❤</span>` : ""}
                <span class="numero-dia">${dia}</span>
                ${data.nota ? `<span class="nota-icono">💬</span>` : ""}
            </div>
        </td>`;

        if ((dia + mes.primerDia) % 7 === 0) html += "</tr><tr>";
    }

    tbody.innerHTML = html + "</tr>";
}

async function mostrarMes() {
    document.querySelectorAll(".mes").forEach(m => m.style.display = "none");
    const mes = meses[mesIndex];
    document.querySelector(`[data-mes="${mes.id}"]`).style.display = "block";
    document.getElementById("mesActual").textContent = mes.nombre;
    await generarCalendario(mes);
}

/* ===== Navegación ===== */
document.getElementById("prevMes").onclick = () => {
    mesIndex = (mesIndex - 1 + meses.length) % meses.length;
    mostrarMes();
};

document.getElementById("nextMes").onclick = () => {
    mesIndex = (mesIndex + 1) % meses.length;
    mostrarMes();
};

/* ===== Popup ===== */
const popup = document.getElementById("popupNota");
const textoNota = document.getElementById("textoNota");
const checkVisto = document.getElementById("checkVisto");

let diaActual = null;

async function abrirPopup(mes, dia) {
    diaActual = { mes, dia };
    const doc = await getDiaRef(mes, dia).get();
    const data = doc.exists ? doc.data() : {};

    textoNota.value = data.nota || "";
    checkVisto.checked = data.corazonMorado === true;
    popup.style.display = "flex";
}

document.getElementById("cerrarPopup").onclick = () => popup.style.display = "none";

document.getElementById("guardarNota").onclick = async () => {
    await getDiaRef(diaActual.mes, diaActual.dia).set({
        nota: textoNota.value.trim() || firebase.firestore.FieldValue.delete(),
        corazonMorado: checkVisto.checked
    }, { merge: true });

    popup.style.display = "none";
    mostrarMes();
};
