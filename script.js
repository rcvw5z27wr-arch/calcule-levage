// Variables globales
const chargeInput = document.getElementById('charge');
const porteeInput = document.getElementById('portee');
const calculBtn = document.getElementById('calculBtn');
const resetBtn = document.getElementById('resetBtn');
const resultatsDiv = document.getElementById('resultats');
const historiqueDiv = document.getElementById('historique');
const listeHistorique = document.getElementById('listeHistorique');

// Événements
calculBtn.addEventListener('click', calculer);
resetBtn.addEventListener('click', reinitialiser);
chargeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculer();
});
porteeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculer();
});

// Charger l'historique au démarrage
chargerHistorique();

function calculer() {
    const charge = parseFloat(chargeInput.value);
    const portee = parseFloat(porteeInput.value);
    
    // Validation
    if (isNaN(charge) || isNaN(portee) || charge <= 0 || portee <= 0) {
        alert('⚠️ Veuillez entrer des valeurs positives pour la charge et la portée');
        return;
    }
    
    // Calculs
    const base = charge / portee;
    const coeff110 = (charge * 1.10) / portee;
    const coeff125 = (charge * 1.25) / portee;
    
    // Afficher les résultats
    document.getElementById('result100').textContent = base.toFixed(2) + ' kg/m';
    document.getElementById('result110').textContent = coeff110.toFixed(2) + ' kg/m';
    document.getElementById('result125').textContent = coeff125.toFixed(2) + ' kg/m';
    
    resultatsDiv.style.display = 'block';
    
    // Sauvegarder dans l'historique
    sauvegarderHistorique({
        charge: charge,
        portee: portee,
        base: base.toFixed(2),
        coeff110: coeff110.toFixed(2),
        coeff125: coeff125.toFixed(2),
        date: new Date().toLocaleString('fr-FR')
    });
}

function reinitialiser() {
    chargeInput.value = '';
    porteeInput.value = '';
    resultatsDiv.style.display = 'none';
    chargeInput.focus();
}

function sauvegarderHistorique(calcul) {
    let historique = JSON.parse(localStorage.getItem('calculeHistorique')) || [];
    historique.unshift(calcul);
    
    // Garder seulement les 10 derniers
    if (historique.length > 10) {
        historique.pop();
    }
    
    localStorage.setItem('calculeHistorique', JSON.stringify(historique));
    chargerHistorique();
}

function chargerHistorique() {
    const historique = JSON.parse(localStorage.getItem('calculeHistorique')) || [];
    
    if (historique.length === 0) {
        historiqueDiv.style.display = 'none';
        return;
    }
    
    historiqueDiv.style.display = 'block';
    listeHistorique.innerHTML = '';
    
    historique.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-historique';
        div.innerHTML = `
            <strong>#${index + 1}</strong> | 
            ${item.charge} kg / ${item.portee} m → 
            100%: ${item.base}, 
            110%: ${item.coeff110}, 
            125%: ${item.coeff125} kg/m 
            <br><small>${item.date}</small>
        `;
        listeHistorique.appendChild(div);
    });
}

function copierResultat(elementId) {
    const element = document.getElementById(elementId);
    const texte = element.textContent;
    
    navigator.clipboard.writeText(texte).then(() => {
        // Feedback visuel
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1500);
    });
}