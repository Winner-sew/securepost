var token = localStorage.getItem('token');
var user = {};
try { user = JSON.parse(localStorage.getItem('user')) || {}; } catch(e) {}

/* si pas connecte on redirige vers la connexion */
if (!token) { window.location.href = 'index.html'; }

/* affichage des infos de l'agent connecte */
if (user.prenom && user.nom) {
    document.getElementById('userInitiales').textContent = user.prenom[0] + user.nom[0];
    document.getElementById('userName').textContent = user.prenom + ' ' + user.nom;
    document.getElementById('userRole').textContent = user.role;
}

/* affichage menu commissaire seulement */
if (user.role === 'commissaire') {
    document.getElementById('menuCommissaire').style.display = 'block';
}
/* graphique d'evolution des actes sur 30 jours
   construit en SVG pur, sans librairie */
async function chargerEvolution() {
    try {
        var reponse = await fetch('https://securepost-api.onrender.com/api/stats/evolution', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();

        if (data.length === 0) {
            document.getElementById('evolutionContainer').innerHTML = '<p class="evolution-vide">Aucune donnee sur les 30 derniers jours</p>';
            return;
        }

        var largeur = Math.max(600, data.length * 40);
        var hauteur = 180;
        var marge = 20;

        var maxTotal = 0;
        data.forEach(function(d) {
            if (parseInt(d.total) > maxTotal) maxTotal = parseInt(d.total);
        });
        if (maxTotal === 0) maxTotal = 1;

        var espacement = (largeur - marge * 2) / (data.length - 1 || 1);

        /* on calcule les points de la ligne */
        var points = '';
        var cercles = '';
        var textes = '';

        data.forEach(function(d, index) {
            var x = marge + (index * espacement);
            var y = hauteur - marge - ((parseInt(d.total) / maxTotal) * (hauteur - marge * 2));

            points += x + ',' + y + ' ';
            cercles += '<circle class="evolution-point" cx="' + x + '" cy="' + y + '" r="3"></circle>';

            /* on affiche une etiquette seulement tous les 3 jours pour pas surcharger */
            if (index % 3 === 0) {
                textes += '<text class="evolution-axe-texte" x="' + x + '" y="' + (hauteur - 2) + '" text-anchor="middle">' + d.jour + '</text>';
            }
        });

        var svg = '<svg class="evolution-svg" viewBox="0 0 ' + largeur + ' ' + hauteur + '" preserveAspectRatio="none">';
        svg += '<polyline class="evolution-ligne" points="' + points + '"></polyline>';
        svg += cercles;
        svg += textes;
        svg += '</svg>';

        document.getElementById('evolutionContainer').innerHTML = svg;

    } catch(e) {
        document.getElementById('evolutionContainer').innerHTML = '<p class="evolution-vide">Erreur de chargement</p>';
    }
}
/* chargement des statistiques depuis l'API */
async function chargerStats() {
    try {
        var reponse = await fetch('https://securepost-api.onrender.com/api/stats/criminality', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();

        document.getElementById('statMois').textContent = data.ce_mois;
        document.getElementById('statCritiques').textContent = data.critiques_en_cours;

        var enCours = data.par_statut.find(function(s) { return s.statut === 'en_cours'; });
        var transmis = data.par_statut.find(function(s) { return s.statut === 'transmis_procureur'; });
        document.getElementById('statEnCours').textContent = enCours ? enCours.total : 0;
        document.getElementById('statTransmis').textContent = transmis ? transmis.total : 0;

        /* affichage top quartiers */
        var htmlQ = '';
        data.par_quartier.forEach(function(q) {
            htmlQ += '<tr><td>' + q.quartier + '</td><td><strong>' + q.total + '</strong></td></tr>';
        });
        document.getElementById('tableauQuartiers').innerHTML = htmlQ;

       /* affichage par type sous forme de graphique en barres */
var labels = {
    main_courante: '<img src="./Images/main-courante.png" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"> Main Courante',
    plainte: '<img src="./Images/plainte.png" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"> Plainte',
    pv_audition: '<img src="./Images/pv.png" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"> PV Audition'
};

var classesCouleur = {
    main_courante: 'main-courante',
    plainte: 'plainte',
    pv_audition: 'pv'
};

/* on cherche la valeur max pour calculer les pourcentages */
var maxValeur = 0;
data.par_type.forEach(function(t) {
    if (t.total > maxValeur) maxValeur = t.total;
});

var htmlT = '';
data.par_type.forEach(function(t) {
    var pourcentage = maxValeur > 0 ? (t.total / maxValeur) * 100 : 0;
    htmlT += '<div class="barre-item">';
    htmlT += '<div class="barre-entete">';
    htmlT += '<span class="barre-label">' + (labels[t.type_acte] || t.type_acte) + '</span>';
    htmlT += '<span class="barre-valeur">' + t.total + '</span>';
    htmlT += '</div>';
    htmlT += '<div class="barre-fond">';
    htmlT += '<div class="barre-remplissage ' + (classesCouleur[t.type_acte] || '') + '" style="width:' + pourcentage + '%"></div>';
    htmlT += '</div>';
    htmlT += '</div>';
});
document.getElementById('graphiqueTypes').innerHTML = htmlT;

    } catch(e) { console.error('Erreur stats:', e); }
}

/* chargement des derniers actes */
async function chargerActes() {
    try {
        var reponse = await fetch('https://securepost-api.onrender.com/api/acts', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();
        var actes = data.actes.slice(0, 8);

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

        var html = '';
        actes.forEach(function(a) {
            var date = new Date(a.date_creation).toLocaleDateString('fr-FR');
            html += '<tr>';
            html += '<td><strong>' + a.numero_acte + '</strong></td>';
            html += '<td>' + a.type_acte.replace(/_/g, ' ') + '</td>';
            html += '<td>' + a.quartier + '</td>';
            html += '<td>' + (badgesGravite[a.gravite] || a.gravite) + '</td>';
            html += '<td>' + (badgesStatut[a.statut] || a.statut) + '</td>';
            html += '<td>' + date + '</td>';
            html += '</tr>';
        });
        document.getElementById('tableauActes').innerHTML = html;

    } catch(e) { console.error('Erreur actes:', e); }
}

/* deconnexion */
function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/* on lance les deux fonctions au chargement */
chargerStats();
chargerActes();
chargerEvolution();