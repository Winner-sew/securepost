# SecurePost

Systeme de Numerisation Securise de Main Courante et Gestion de Commissariat - Commissariat de Pointe-Noire, Republique du Congo.

## Presentation

SecurePost est une application web Full-Stack permettant de numeriser la gestion quotidienne d'un commissariat de police. Elle remplace les registres papier par un systeme digital securise pour enregistrer et suivre :

- Mains Courantes : declarations de faits sans qualification penale
- Plaintes : signalements formalises d'infractions
- Proces-Verbaux (PV) : transcriptions d'auditions

## Technologies utilisees

| Composant | Technologie |
|---|---|
| Frontend | HTML5, CSS3, JavaScript Vanilla |
| Backend | Node.js, Express.js |
| Base de donnees | PostgreSQL |
| Authentification | JWT (JSON Web Token) |

## Structure du projet
## Installation en local

### 1. Cloner le depot

```bash
git clone https://github.com/Winner-sew/securepost.git
cd securepost
```

### 2. Configurer la base de donnees PostgreSQL

Creer une base nommee securepost_db dans pgAdmin, puis executer le script SQL fourni pour la creation des tables et l'insertion des donnees de test.

### 3. Configurer le backend

```bash
cd backend
npm install
```

Creer un fichier .env avec :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=securepost_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=securepost_secret_key_2026
PORT=3000
```

### 4. Lancer le serveur

```bash
node server.js
```

### 5. Lancer le frontend

Ouvrir frontend/index.html avec l'extension Live Server de VS Code.

## Comptes de test

| Email | Mot de passe | Role |
|---|---|---|
| e.siassia@securepost.cg | Siassia2026 | Commissaire |
| a.okemba@securepost.cg | Okemba2026 | Officier |

## Auteur

Erwin Christopher Siassia - ECAM Pointe-Noire, Licence GIIA 2eme annee

## Projet academique

Cahier des charges fourni dans le cadre d'un projet de Genie Informatique et Intelligence Artificielle - Juin 2026.
## Vidéo de démonstration

Lien vers la vidéo YouTube présentant le parcours complet d'un acte : https://youtu.be/TON_LIEN_ICI