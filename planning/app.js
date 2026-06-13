import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// VUL HIER JOUW EIGEN FIREBASE CONFIG IN:
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

// Datum bepalen voor vandaag (moet exact matchen met de sleutel uit de editor)
const vandaag = new Date();
const datumSleutel = `${vandaag.getFullYear()}-${String(vandaag.getMonth() + 1).padStart(2, '0')}-${String(vandaag.getDate()).padStart(2, '0')}`;

// Toon de datum mooi voluit in de header
const opties = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('live-date').innerText = vandaag.toLocaleDateString('nl-NL', opties);

const planbordGrid = document.getElementById('planbord-grid');
const planningRef = doc(db, "planningen", datumSleutel);

// Luister live naar de database
onSnapshot(planningRef, (snapshot) => {
    if (!planbordGrid) return;
    planbordGrid.innerHTML = ""; // Wis de laadtekst

    if (snapshot.exists()) {
        const data = snapshot.data().begeleiders;

        // Bouw voor elke begeleider een kolom (card) op het scherm
        for (const [begeleider, kinderen] of Object.entries(data)) {
            const card = document.createElement('div');
            card.className = 'begeleider-card';
            
            let kinderenHtml = '';
            if (kinderen.length === 0) {
                kinderenHtml = '<div class="kind-badge" style="color: #95a5a6; font-style: italic;">Geen kinderen ingedeeld</div>';
            } else {
                kinderen.forEach(kind => {
                    kinderenHtml += `
                        <div class="kind-badge">
                            👶 <span>${kind}</span>
                        </div>
                    `;
                });
            }

            card.innerHTML = `
                <h2>👤 ${begeleider}</h2>
                <div class="kinderen-list">
                    ${kinderenHtml}
                </div>
            `;
            planbordGrid.appendChild(card);
        }
    } else {
        // Als er in de editor nog niks is ingevuld voor vandaag
        planbordGrid.innerHTML = `<div class="loading-message">❌ Er is voor vandaag (${datumSleutel}) nog geen planning aangemaakt in de editor.</div>`;
    }
});

const themeButton = document.getElementById('theme-button');

// Check bij het laden of de gebruiker al eerder donkere modus heeft gekozen
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeButton.innerText = "☀️ Licht";
}

// Luister naar klikken op de knop
themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeButton.innerText = "☀️ Licht";
        localStorage.setItem('theme', 'dark'); // Opslaan in de browser
    } else {
        themeButton.innerText = "🌙 Donker";
        localStorage.setItem('theme', 'light'); // Opslaan in de browser
    }
});
