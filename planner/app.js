import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 1. Jouw Firebase configuratie
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

// 2. Datum bepalen voor de database-sleutel (YYYY-MM-DD)
const vandaag = new Date();
const datumSleutel = `${vandaag.getFullYear()}-${String(vandaag.getMonth() + 1).padStart(2, '0')}-${String(vandaag.getDate()).padStart(2, '0')}`;

const planningRef = doc(db, "planningen", datumSleutel);
const begeleidersConfigRef = doc(db, "instellingen", "begeleidersDoc"); // Verwijzing naar je collega-beheer

// 3. DOM Elementen ophalen
const addChildForm = document.getElementById('add-child-form');
const editorGrid = document.getElementById('editor-grid');
const selectBegeleider = document.getElementById('select-begeleider');

// === NIEUW: Live inladen van de collega's in het keuzemenu (<select>) ===
onSnapshot(begeleidersConfigRef, (snapshot) => {
    // Reset de select-opties, maar behoud de allereerste "Kies begeleider..." placeholder
    selectBegeleider.innerHTML = '<option value="" disabled selected>Kies begeleider...</option>';

    if (snapshot.exists() && snapshot.data().namen) {
        const namen = snapshot.data().namen;
        
        // Voeg elke live collega toe aan het keuzemenu
        namen.forEach(naam => {
            const option = document.createElement('option');
            option.value = naam;
            option.innerText = naam;
            selectBegeleider.appendChild(option);
        });
    }
    
    // Voeg als vaste fallback altijd de Flexplek optie onderaan toe
    const flexOption = document.createElement('option');
    flexOption.value = "Flexplek";
    flexOption.innerText = "Flexplek / Onbekend";
    selectBegeleider.appendChild(flexOption);
});

// 4. Live de huidige verdeling inladen in de editor
onSnapshot(planningRef, (snapshot) => {
    editorGrid.innerHTML = "";

    if (snapshot.exists() && snapshot.data().begeleiders) {
        const data = snapshot.data().begeleiders;

        for (const [begeleider, kinderen] of Object.entries(data)) {
            const card = document.createElement('div');
            card.className = 'begeleider-card';
            
            let kinderenHtml = '';
            
            if (!kinderen || kinderen.length === 0) {
                kinderenHtml = '<p style="color: #95a5a6; font-style: italic; margin: 0;">Geen kinderen</p>';
            } else {
                kinderen.forEach(kind => {
                    kinderenHtml += `
                        <div class="kind-row">
                            <span class="kind-name">👶 ${kind}</span>
                            <button class="btn-delete" data-begeleider="${begeleider}" data-kind="${kind}">🗑️</button>
                        </div>
                    `;
                });
            }

            card.innerHTML = `
                <h3>👤 ${begeleider}</h3>
                <div class="kinderen-list">${kinderenHtml}</div>
            `;
            editorGrid.appendChild(card);
        }

        // Knoppen voor verwijderen activeren
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonElement = e.target.closest('.btn-delete');
                const begeleider = buttonElement.getAttribute('data-begeleider');
                const kind = buttonElement.getAttribute('data-kind');
                verwijderKind(begeleider, kind);
            });
        });

    } else {
        editorGrid.innerHTML = "<p>Nog geen planning voor vandaag. Voeg een kind toe om te beginnen!</p>";
    }
});

// 5. Kind Toevoegen aan Firebase
addChildForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const kindNaam = document.getElementById('child-name').value.trim();
    const geselecteerdeBegeleider = selectBegeleider.value;

    if (!kindNaam || !geselecteerdeBegeleider) return;

    try {
        await setDoc(planningRef, {
            begeleiders: {
                [geselecteerdeBegeleider]: arrayUnion(kindNaam)
            }
        }, { merge: true });

        // Formulier resetten
        document.getElementById('child-name').value = "";
        selectBegeleider.selectedIndex = 0;
    } catch (error) {
        console.error("Fout bij toevoegen:", error);
        alert("Er ging iets mis bij het opslaan.");
    }
});

// 6. Kind Verwijderen uit Firebase
async function verwijderKind(begeleider, kindNaam) {
    try {
        await updateDoc(planningRef, {
            [`begeleiders.${begeleider}`]: arrayRemove(kindNaam)
        });
    } catch (error) {
        console.error("Fout bij verwijderen:", error);
    }
}

// --- INTERFACE LOGICA (THEMA & MENU) ---

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
