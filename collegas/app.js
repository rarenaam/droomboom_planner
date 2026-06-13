import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase configuratie
const firebaseConfig = {
  apiKey: "AIzaSyBpJ7VnA7Z9zrb8K4adtz8g4lpXeyk_i2M",
  authDomain: "studio-6160446129-eb66a.firebaseapp.com",
  projectId: "studio-6160446129-eb66a",
  storageBucket: "studio-6160446129-eb66a.firebasestorage.app",
  messagingSenderId: "248966967112",
  appId: "1:248966967112:web:415456d13a30e164790d7d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const configRef = doc(db, "instellingen", "begeleidersDoc");

// === PLAK HIERONDER JE SHAREPOINT DOWNLOAD LINK TUSSEN DE AANHALINGSTEKENS ===
const excelCsvUrl = "https://stichtingdedroomboom.sharepoint.com/sites/DirectieKluis/_layouts/15/Doc.aspx?sourcedoc={313e7626-e388-440c-8c33-a22e4b01413d}&action=download&wdAllowInteractivity=False&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True&wdInConfigurator=True&wdInConfigurator=True&edaebf=rslc0";
const lijstDiv = document.getElementById('collega-lijst');

// Functie die de SharePoint Excel live uitleest en naar Firebase stuurt
async function synchroniseerMetSharePoint() {
    try {
        const response = await fetch(excelCsvUrl);
        const text = await response.text();
        const regels = text.split(/\r?\n/);
        const uniekeNamen = [];

        // We starten bij rij 3 (index 2) omdat rij 1 en 2 de koppen bevatten
        for (let i = 2; i < regels.length; i++) {
            const regel = regels[i].trim();
            if (!regel) continue;

            // Split de regel op komma of puntkomma
            const kolommen = regel.split(/[;,]/);
            const naam = kolommen[0] ? kolommen[0].replace(/"/g, '').trim() : "";
            
            // Filter lege regels en koppen uit de data
            if (naam && naam.length > 1 && !naam.toLowerCase().includes("dag")) {
                if (!uniekeNamen.includes(naam)) {
                    uniekeNamen.push(naam);
                }
            }
        }

        // Synchroniseer de lijst met Firebase
        await setDoc(configRef, { namen: uniekeNamen }, { merge: true });
        console.log("Synchronisatie met SharePoint gelukt!");
    } catch (error) {
        console.error("Fout bij ophalen SharePoint-bestand:", error);
    }
}

// Haal de lijst op uit Firebase voor de weergave
onSnapshot(configRef, (snapshot) => {
    lijstDiv.innerHTML = "";
    if (snapshot.exists() && snapshot.data().namen) {
        snapshot.data().namen.forEach(naam => {
            const row = document.createElement('div');
            row.className = 'kind-row';
            row.innerHTML = `<span class="kind-name">👤 ${naam}</span>`;
            lijstDiv.appendChild(row);
        });
    }
});

// Start proces
synchroniseerMetSharePoint();

// --- UI LOGICA ---
const themeButton = document.getElementById('theme-button');
themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
menuClose.addEventListener('click', () => sidebar.classList.remove('open'));
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== menuToggle) sidebar.classList.remove('open');
});
