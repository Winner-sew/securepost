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

router.get('/criminality', verifierToken, async (req, res) => {
    try {
        const parType = await pool.query(`
            SELECT type_acte, COUNT(*) as total
            FROM acts
            GROUP BY type_acte
            ORDER BY total DESC
        `);

        const parStatut = await pool.query(`
            SELECT statut, COUNT(*) as total
            FROM acts
            GROUP BY statut
            ORDER BY total DESC
        `);

        const parGravite = await pool.query(`
            SELECT gravite, COUNT(*) as total
            FROM acts
            GROUP BY gravite
            ORDER BY total DESC
        `);

        const parQuartier = await pool.query(`
            SELECT quartier, COUNT(*) as total
            FROM acts
            GROUP BY quartier
            ORDER BY total DESC
            LIMIT 5
        `);

        const cemois = await pool.query(`
            SELECT COUNT(*) as total
            FROM acts
            WHERE EXTRACT(MONTH FROM date_creation) = EXTRACT(MONTH FROM NOW())
            AND EXTRACT(YEAR FROM date_creation) = EXTRACT(YEAR FROM NOW())
        `);

        const critiques = await pool.query(`
            SELECT COUNT(*) as total
            FROM acts
            WHERE gravite = 'critique' AND statut = 'en_cours'
        `);

        res.json({
            par_type: parType.rows,
            par_statut: parStatut.rows,
            par_gravite: parGravite.rows,
            par_quartier: parQuartier.rows,
            ce_mois: cemois.rows[0].total,
            critiques_en_cours: critiques.rows[0].total
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
});

router.get('/logs', verifierToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.*, u.nom, u.prenom, u.role
            FROM audit_logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.date_action DESC
            LIMIT 50
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
});
router.get('/evolution', verifierToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT TO_CHAR(date_creation, 'DD/MM') as jour, COUNT(*) as total
            FROM acts
            WHERE date_creation >= NOW() - INTERVAL '30 days'
            GROUP BY jour, DATE(date_creation)
            ORDER BY DATE(date_creation) ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
module.exports = router;