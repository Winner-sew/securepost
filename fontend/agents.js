/* ============================================
   SECUREPOST - Script Gestion des Agents
   Auteur : Erwin Christopher Siassia
   Date : Juin 2026
   ============================================ */

var token = localStorage.getItem('token');
var user = {};
try { user = JSON.parse(localStorage.getItem('user')) || {}; } catch(e) {}

/* seul le commissaire peut acceder a cette page */
if (!token) { window.location.href = 'index.html'; }
if (user.role !== 'commissaire') { window.location.href = 'dashboard.html'; }

if (user.prenom && user.nom) {
    document.getElementById('userInitiales').textContent = user.prenom[0] + user.nom[0];
    document.getElementById('userName').textContent = user.prenom + ' ' + user.nom;
    document.getElementById('userRole').textContent = user.role;
}

/* chargement des agents depuis la BDD */
async function chargerAgents() {
    try {
        var reponse = await fetch('http://localhost:3000/api/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();
        afficherAgents(data.users);
    } catch(e) {
        document.getElementById('listeAgents').innerHTML = '<p>Erreur de chargement</p>';
    }
}

/* affichage des cartes agents */
function afficherAgents(agents) {
    var html = '';
    agents.forEach(function(a) {
        var initiales = a.prenom[0] + a.nom[0];
        html += '<div class="agent-carte ' + a.role + '">';
        html += '<div class="agent-entete">';
        html += '<div class="agent-avatar ' + a.role + '">' + initiales + '</div>';
        html += '<div>';
        html += '<div class="agent-nom">' + a.nom + ' ' + a.prenom + '</div>';
        html += '<div class="agent-matricule">' + a.matricule + ' — ' + a.role + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="agent-infos">';
        html += '<span>Email : ' + a.email + '</span>';
        html += '<span>Brigade : ' + (a.workspace_nom || '-') + '</span>';
        html += '</div>';
        html += '<div class="agent-actions">';
        html += '<button class="btn-modifier-agent" onclick="modifierAgent(' + a.id + ')">Modifier</button>';
        html += '<button class="btn-supprimer-agent" onclick="supprimerAgent(' + a.id + ')">Désactiver</button>';
        html += '</div>';
        html += '</div>';
    });
    document.getElementById('listeAgents').innerHTML = html;
}

/* ajouter un nouvel agent */
async function ajouterAgent() {
    var alerteErr = document.getElementById('alertErreur');
    var alerteOk = document.getElementById('alertSucces');
    alerteErr.style.display = 'none';
    alerteOk.style.display = 'none';

    var nom = document.getElementById('agentNom').value;
    var prenom = document.getElementById('agentPrenom').value;
    var matricule = document.getElementById('agentMatricule').value;
    var email = document.getElementById('agentEmail').value;
    var motDePasse = document.getElementById('agentMotDePasse').value;
    var role = document.getElementById('agentRole').value;

    if (!nom || !prenom || !matricule || !email || !motDePasse) {
        alerteErr.style.display = 'block';
        alerteErr.textContent = 'Veuillez remplir tous les champs obligatoires';
        return;
    }

    try {
        var reponse = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                nom: nom,
                prenom: prenom,
                matricule: matricule,
                email: email,
                mot_de_passe: motDePasse,
                role: role,
                workspace_id: 1
            })
        });

        var data = await reponse.json();

        if (reponse.ok) {
            alerteOk.style.display = 'block';
            alerteOk.textContent = 'Agent ' + prenom + ' ' + nom + ' ajouté avec succès !';
            chargerAgents();
        } else {
            alerteErr.style.display = 'block';
            alerteErr.textContent = data.message || 'Erreur lors de l\'ajout';
        }

    } catch(e) {
        alerteErr.style.display = 'block';
        alerteErr.textContent = 'Impossible de contacter le serveur';
    }
}

/* modifier un agent */
function modifierAgent(id) {
    alert('Fonctionnalité en cours de développement');
}

/* desactiver un agent */
async function supprimerAgent(id) {
    if (!confirm('Confirmer la désactivation de cet agent ?')) return;

    try {
        var reponse = await fetch('http://localhost:3000/api/users/' + id + '/desactiver', {
            method: 'PATCH',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (reponse.ok) {
            alert('Agent désactivé avec succès');
            chargerAgents();
        }
    } catch(e) {
        alert('Erreur lors de la désactivation');
    }
}

/* deconnexion */
function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

chargerAgents();