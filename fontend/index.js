/* ============================================
   SECUREPOST - Script Page de Connexion
   Auteur : Erwin Christopher Siassia
   Date : Juin 2026
   ============================================ */

/* verification si deja connecte
   si oui on redirige directement */
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

/* on attend que le bouton soit clique */
document.getElementById('btnConnecter').addEventListener('click', seConnecter);

/* connexion aussi avec la touche entree */
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') seConnecter();
});

/* fonction principale de connexion */
async function seConnecter() {
    var email = document.getElementById('email').value;
    var motDePasse = document.getElementById('motDePasse').value;
    var alerte = document.getElementById('alertErreur');

    /* on cache l'alerte au debut */
    alerte.style.display = 'none';

    /* verification que les champs sont remplis */
    if (!email || !motDePasse) {
        alerte.style.display = 'block';
        alerte.textContent = 'Veuillez remplir tous les champs';
        return;
    }

    try {
        /* appel API vers notre backend Node.js */
        var reponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, mot_de_passe: motDePasse })
        });

        var data = await reponse.json();

        if (reponse.ok) {
            /* on sauvegarde le token et les infos
               dans le localStorage du navigateur */
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            /* redirection vers le tableau de bord */
            window.location.href = 'dashboard.html';
        } else {
            alerte.style.display = 'block';
            alerte.textContent = data.message;
        }

    } catch (erreur) {
        alerte.style.display = 'block';
        alerte.textContent = 'Impossible de contacter le serveur';
    }
}