document.addEventListener("DOMContentLoaded", () => {
	/* ===== Firebase ===== */
	const firebaseConfig = {
	  apiKey: "AIzaSyCrbTzyqh7AbCCJdNJwxzhZ-U8js2_2suA",
	  authDomain: "sanva-jm.firebaseapp.com",
	  projectId: "sanva-jm",
	  storageBucket: "sanva-jm.firebasestorage.app",
	  messagingSenderId: "44847411302",
	  appId: "1:44847411302:web:3356d2251f2ced82f1fda7"
	};

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
		{ id:"febrero", nombre:"Febrero", dias:28, primerDia:6, especiales:{} },
		{ id:"marzo", nombre:"Marzo", dias:31, primerDia:6, especiales:{} },
		{ id:"abril", nombre:"Abril", dias:30, primerDia:2, especiales:{} },
		{ id:"mayo", nombre:"Mayo", dias:31, primerDia:4, especiales:{} },
		{ id:"junio", nombre:"Junio", dias:30, primerDia:0, especiales:{} },
		{ id:"julio", nombre:"Julio", dias:31, primerDia:2, especiales:{} },
		{ id:"agosto", nombre:"Agosto", dias:31, primerDia:5, especiales:{} },
		{ id:"septiembre", nombre:"Septiembre", dias:30, primerDia:1, especiales:{} },
		{ id:"octubre", nombre:"Octubre", dias:31, primerDia:3, especiales:{} },
		{ id:"noviembre", nombre:"Noviembre", dias:30, primerDia:6, especiales:{} },
		{ id:"diciembre", nombre:"Diciembre", dias:31, primerDia:1, especiales:{} }
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

	/* ===== Fondo de corazones flotantes ===== */
	const fondo = document.getElementById("fondo");

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

	/* ===== Imágenes flotantes ===== */
	const imgSources = ["GR.png", "bunny.png", "suki.png"];
	const maxImgs = 2;

	imgSources.forEach(src => {
		for (let i = 0; i < maxImgs; i++) {
			const img = document.createElement("img");
			img.src = src;
			img.classList.add("floating-img");

			img.style.left = Math.random() * window.innerWidth + "px";
			img.style.top = Math.random() * window.innerHeight + "px";
			img.style.width = (Math.random() * 30 + 40) + "px";
			img.style.animationDuration = (Math.random() * 5 + 8) + "s";
			img.style.animationDelay = (Math.random() * 5) + "s";

			fondo.appendChild(img);
		}
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
		const contenedor = document.querySelector(`[data-mes="${mes.id}"]`);

		contenedor.style.display = "block";
		contenedor.style.animation = "none";
		contenedor.offsetHeight;
		contenedor.style.animation = "fadeSlide 0.35s ease";

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
});
