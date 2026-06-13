/* ============================================
   SECUREPOST - Script Mon Profil
   Auteur : Erwin Christopher Siassia
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

if (user.role === 'commissaire') {
    document.getElementById('menuCommissaire').style.display = 'block';
}

/* chargement des infos du profil */
async function chargerProfil() {
    try {
        var reponse = await fetch('https://securepost-api.onrender.com/api/users/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await reponse.json();

        document.getElementById('profilAvatar').textContent = data.prenom[0] + data.nom[0];
        document.getElementById('profilNom').textContent = data.prenom + ' ' + data.nom;
        document.getElementById('profilMatricule').textContent = data.matricule;
        document.getElementById('profilRole').textContent = data.role;
        document.getElementById('profilBrigade').textContent = data.workspace_nom || '-';
        document.getElementById('profilDate').textContent = new Date(data.date_creation).toLocaleDateString('fr-FR');
        document.getElementById('profilEmail').value = data.email;

    } catch(e) {
        afficherToast('Erreur de chargement du profil', 'erreur');
    }
}

/* enregistrer les modifications du profil */
async function enregistrerProfil() {
    var email = document.getElementById('profilEmail').value;
    var motDePasse = document.getElementById('profilMotDePasse').value;

    if (!email) {
        afficherToast('L\'email ne peut pas etre vide', 'erreur');
        return;
    }

    try {
        var reponse = await fetch('https://securepost-api.onrender.com/api/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ email: email, mot_de_passe: motDePasse || null })
        });

        if (reponse.ok) {
            afficherToast('Profil mis a jour avec succes', 'succes');
            document.getElementById('profilMotDePasse').value = '';
        } else {
            afficherToast('Erreur lors de la mise a jour', 'erreur');
        }
    } catch(e) {
        afficherToast('Impossible de contacter le serveur', 'erreur');
    }
}

function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

chargerProfil();