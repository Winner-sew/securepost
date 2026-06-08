/* ============================================
   SECUREPOST - Script Affaires Prioritaires
   Auteur : Erwin Christopher Siassia
   Date : Juin 2026
   ============================================ */

var token = localStorage.getItem('token');
var user = {};
try { user = JSON.parse(localStorage.getItem('user')) || {}; } catch(e) {}

if (!token) { window.location.href = 'index.html'; }

if (user.prenom && user.nom) {
    document.getElementById('userInitiales').textContent = user.prenom[0] + user.nom[0];
    document.getElementById('userName').textContent = user.prenom + ' ' + user.nom;
    document.getElementById('userRole').textContent = user.role;
}

var badgesStatut = {
    'en_cours': '<span class="badge badge-bleu">En cours</span>',
    'transmis_procureur': '<span class="badge badge-orange">Transmis</span>',
    'classe_sans_suite': '<span class="badge badge-gris">Classe</span>'
};

var badgesGravite = {
    'faible': '<span class="badge badge-gris">Faible</span>',
    'moyen': '<span class="badge badge-orange">Moyen</span>',
    'critique': '<span class="badge badge-rouge">Critique</span>'
};

var labelsType = {
    'main_courante': 'Main Courante',
    'plainte': 'Plainte',
    'pv_audition': 'PV Audition'
};

/* chargement et affichage des affaires prioritaires */
function chargerPrioritaires() {
    var prioritaires = JSON.parse(localStorage.getItem('prioritaires') || '[]');

    document.getElementById('compteurPrioritaires').textContent = prioritaires.length;
    var critiques = prioritaires.filter(function(a) { return a.gravite === 'critique'; });
    document.getElementById('compteurCritiques').textContent = critiques.length;

    if (prioritaires.length === 0) {
        document.getElementById('messageVide').style.display = 'block';
        document.getElementById('listePrioritaires').innerHTML = '';
        return;
    }

    document.getElementById('messageVide').style.display = 'none';

    var html = '<div class="prioritaires-liste">';
    prioritaires.forEach(function(a, index) {
        var date = new Date(a.date_creation).toLocaleDateString('fr-FR');
        var couleurBordure = a.gravite === 'critique' ? '#ef4444' : a.gravite === 'moyen' ? '#f97316' : '#6b7280';

        html += '<div class="prioritaire-carte" style="border-left-color:' + couleurBordure + '">';
        html += '<div class="prioritaire-entete">';
        html += '<div>';
        html += '<h3 class="prioritaire-numero">' + a.numero_acte + '</h3>';
        html += '<p class="prioritaire-type">' + (labelsType[a.type_acte] || a.type_acte) + ' — ' + a.quartier + '</p>';
        html += '</div>';
        html += '<div class="prioritaire-badges">';
        html += (badgesGravite[a.gravite] || a.gravite);
        html += (badgesStatut[a.statut] || a.statut);
        html += '<button class="btn-retirer" onclick="desepingler(' + index + ')">Retirer</button>';
        html += '</div>';
        html += '</div>';
        html += '<p class="prioritaire-contenu">' + a.contenu.substring(0, 200) + (a.contenu.length > 200 ? '...' : '') + '</p>';
        html += '<div class="prioritaire-infos">';
        if (a.declarant_nom) html += '<span>Declarant : ' + a.declarant_prenom + ' ' + a.declarant_nom + '</span>';
        if (a.victime_nom) html += '<span>Victime : ' + a.victime_prenom + ' ' + a.victime_nom + '</span>';
        if (a.suspect_nom) html += '<span>Suspect : ' + a.suspect_prenom + ' ' + a.suspect_nom + '</span>';
        html += '<span>' + date + '</span>';
        html += '</div>';
        html += '</div>';
    });
    html += '</div>';
    document.getElementById('listePrioritaires').innerHTML = html;
}

/* supprimer un acte des prioritaires */
function desepingler(index) {
    var prioritaires = JSON.parse(localStorage.getItem('prioritaires') || '[]');
    prioritaires.splice(index, 1);
    localStorage.setItem('prioritaires', JSON.stringify(prioritaires));
    chargerPrioritaires();
}

/* deconnexion */
function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

chargerPrioritaires();