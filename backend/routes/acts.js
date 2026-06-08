const express = require('express');
const router = express.Router();
const pool = require('../db');

const verifierToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: '❌ Token manquant' });
    
    const jwt = require('jsonwebtoken');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: '❌ Token invalide' });
    }
};

router.get('/', verifierToken, async (req, res) => {
    try {
        const { type, statut, gravite, quartier, search } = req.query;
        
        let query = `
            SELECT a.*, 
                   u.nom as agent_nom, u.prenom as agent_prenom,
                   w.nom as brigade_nom
            FROM acts a
            LEFT JOIN users u ON a.agent_id = u.id
            LEFT JOIN workspaces w ON a.workspace_id = w.id
            WHERE 1=1
        `;
        const params = [];
        let i = 1;

        if (type) { query += ` AND a.type_acte = $${i++}`; params.push(type); }
        if (statut) { query += ` AND a.statut = $${i++}`; params.push(statut); }
        if (gravite) { query += ` AND a.gravite = $${i++}`; params.push(gravite); }
        if (quartier) { query += ` AND a.quartier ILIKE $${i++}`; params.push(`%${quartier}%`); }
        if (search) {
            query += ` AND (a.numero_acte ILIKE $${i} OR a.declarant_nom ILIKE $${i} OR a.victime_nom ILIKE $${i} OR a.suspect_nom ILIKE $${i})`;
            params.push(`%${search}%`); i++;
        }

        query += ' ORDER BY a.date_creation DESC';

        const result = await pool.query(query, params);
        res.json({ total: result.rows.length, actes: result.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
});

router.get('/:id', verifierToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, u.nom as agent_nom, u.prenom as agent_prenom, w.nom as brigade_nom
             FROM acts a
             LEFT JOIN users u ON a.agent_id = u.id
             LEFT JOIN workspaces w ON a.workspace_id = w.id
             WHERE a.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Acte non trouvé' });
        }

        await pool.query(
            'INSERT INTO audit_logs (user_id, action, table_cible, acte_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'CONSULTATION', 'acts', req.params.id, `Consultation de l acte ${result.rows[0].numero_acte}`, req.ip]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
});

router.post('/', verifierToken, async (req, res) => {
    try {
        const {
            type_acte, date_faits, quartier, contenu,
            declarant_nom, declarant_prenom,
            victime_nom, victime_prenom,
            suspect_nom, suspect_prenom,
            statut, gravite, workspace_id
        } = req.body;

        const annee = new Date().getFullYear();
        const prefixes = { 
            main_courante: 'MC', 
            plainte: 'PL', 
            pv_audition: 'PV' 
        };
        const prefix = prefixes[type_acte];

        const count = await pool.query(
            'SELECT COUNT(*) FROM acts WHERE type_acte = $1 AND EXTRACT(YEAR FROM date_creation) = $2',
            [type_acte, annee]
        );
        const numero = String(parseInt(count.rows[0].count) + 1).padStart(3, '0');
        const numero_acte = `${prefix}/${annee}/PNR/${numero}`;

        const result = await pool.query(
            `INSERT INTO acts (
                numero_acte, type_acte, date_faits, quartier, contenu,
                declarant_nom, declarant_prenom, victime_nom, victime_prenom,
                suspect_nom, suspect_prenom, statut, gravite, workspace_id, agent_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
            RETURNING *`,
            [numero_acte, type_acte, date_faits, quartier, contenu,
             declarant_nom, declarant_prenom, victime_nom, victime_prenom,
             suspect_nom, suspect_prenom, statut || 'en_cours', 
             gravite || 'faible', workspace_id, req.user.id]
        );

        await pool.query(
            'INSERT INTO audit_logs (user_id, action, table_cible, acte_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'CREATION', 'acts', result.rows[0].id, `Création de l acte ${numero_acte}`, req.ip]
        );

        res.status(201).json({ 
            message: '✅ Acte créé avec succès', 
            acte: result.rows[0] 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
});

router.patch('/:id/statut', verifierToken, async (req, res) => {
    try {
        const { statut } = req.body;
        
        const result = await pool.query(
            'UPDATE acts SET statut = $1 WHERE id = $2 RETURNING *',
            [statut, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Acte non trouvé' });
        }

        await pool.query(
            'INSERT INTO audit_logs (user_id, action, table_cible, acte_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'MODIFICATION', 'acts', req.params.id, `Statut changé vers: ${statut}`, req.ip]
        );

        res.json({ message: '✅ Statut mis à jour', acte: result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
});

module.exports = router;