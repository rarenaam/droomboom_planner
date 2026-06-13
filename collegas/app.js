import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// === VUL HIER JE EIGEN FIREBASE CONFIG IN ===
const firebaseConfig = {
  apiKey: "AIzaSyBpJ7VnA7Z9zrb8K4adtz8g4lpXeyk_i2M",
  authDomain: "studio-6160446129-eb66a.firebaseapp.com",
  projectId: "studio-6160446129-eb66a",
  storageBucket: "studio-6160446129-eb66a.firebasestorage.app",
  messagingSenderId: "248966967112",
  appId: "1:248966967112:web:415456d13a30e164790d7d"
};

// Firebase initialiseren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Verwijzing naar het document waar we de lijst met begeleiders in bewaren
const configRef = doc(db, "instellingen", "begeleidersDoc");

const form = document.getElementById('add-begeleider-form');
const lijstDiv = document.getElementById('collega-lijst');

// 1. Live de huidige collega's inladen uit Firebase
onSnapshot(configRef, (snapshot) => {
    lijstDiv.innerHTML = "";

    if (snapshot.exists() && snapshot.data().namen) {
        const namen = snapshot.data().namen;

        if (namen.length === 0) {
            lijstDiv.innerHTML = "<p>Er zijn nog geen begeleiders toegevoegd.</p>";
            return;
        }

        // Loop door alle namen en maak er mooie rijen van (zelfde styling als de kinderen)
        namen.forEach(naam => {
            const row = document.createElement('div');
            row.className = 'kind-row';
            row.innerHTML = `
                <span class="kind-name">👤 ${naam}</span>
                <button class="btn-delete" data-naam="${naam}">🗑️</button>
            `;
            lijstDiv.appendChild(row);
        });

        // Verwijder-knoppen (ontslagen) activeren
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const buttonElement = e.target.closest('.btn-delete');
                const naamTeVerwijderen = buttonElement.getAttribute('data-naam');
                
                if (confirm(`Weet je zeker dat je ${naamTeVerwijderen} wilt verwijderen uit het systeem?`)) {
                    await updateDoc(configRef, {
                        namen: arrayRemove(naamTeVerwijderen)
                    });
                }
            });
        });
    } else {
        lijstDiv.innerHTML = "<p>Geen data gevonden. Voeg je eerste collega toe!</p>";
    }
});

// 2. Collega toevoegen (Aannemen) via het formulier
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputVeld = document.getElementById('begeleider-name');
    const nieuweNaam = inputVeld.value.trim();
    
    if (!nieuweNaam) return;

    try {
        // Voeg de naam toe aan de array in Firebase (maakt het document aan als het nog niet bestaat)
        await setDoc(configRef, {
            namen: arrayUnion(nieuweNaam)
        }, { merge: true });
        
        inputVeld.value = ""; // Maak het inputveld netjes leeg
    } catch (error) {
        console.error("Fout bij toevoegen collega:", error);
    }
});

// 3. Donkere modus logica (onthoudt de keuze van de gebruiker)
const themeButton = document.getElementById('theme-button');
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeButton.innerText = "☀️ Licht";
}

themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeButton.innerText = "☀️ Licht";
        localStorage.setItem('theme', 'dark');
    } else {
        themeButton.innerText = "🌙 Donker";
        localStorage.setItem('theme', 'light');
    }
});

// 4. Hamburger menu logica (openen en sluiten van de sidebar)
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');

menuToggle.addEventListener('click', () => {
    sidebar.classList.add('open');
});

menuClose.addEventListener('click', () => {
    sidebar.classList.remove('open');
});

document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== menuToggle) {
        sidebar.classList.remove('open');
    }
});
