const express = require("express");
const router = express.Router();
const db = require("../mysql").pool;




/// Configuração do pool de conexões MySQL



/// Rota para obter uma venda específica por ID


router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    db.query("SELECT *  FROM vendas WHERE id=?", [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        if (rows.length === 0) {
            return res.status(404).send({
                message: "Venda Não Encontrada"
            });
        }

        res.status(200).send({
            message: "Aqui Está A Venda Solicitada",
            vendas: rows[0]
        });
    });
});

/// Rota para obter todas as vendas
router.get("/", (req, res, next) => {
    db.query(`SELECT
                    venda.id as id,
                    venda.cliente_id as cliente_id,
                    venda.data_venda as data_venda,
                    venda.valor_total as valor_total,
                    cliente.nome as cliente_nome
                FROM vendas
                INNER JOIN cliente 
                ON venda.cliente_id = cliente.id`, (error, rows) => {
        if (error) {
            console.error("Erro na rota GET /:", error);
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            message: "Aqui está a Lista De todas as Vendas",
            vendas: rows
        });
    });
});

/// Rota para criar uma nova Venda

router.post('/', (req, res, next) => {
    const { cliente_id, data_venda, valor_total } = req.body;

    if (!cliente_id || !data_venda || !valor_total) {
        return res.status(400).send({
            message: "Parâmetros Inválidos"
        });
    }

    db.query(`INSERT INTO vendas (cliente_id, data_venda, valor_total) VALUES (?, ?, ?)`,
        [cliente_id, data_venda, valor_total], (error, results) => {
            if (error) {
                console.error("Erro na Rota POST /:", error);
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(201).send({
                message: "Venda Criada com Sucesso!",
                vendas: {
                    id: results.insertId,
                    cliente_id,
                    data_venda,
                    valor_total
                }
            });
        });
});

/// Rota para atualizar uma Venda Existente

router.put("/", (req, res, next) => {
    const { id, cliente_id, data_venda, valor_total } = req.body;

    if (!cliente_id || !data_venda || !valor_total) {
        return res.status(400).send({
            message: "Parâmetros Inválidos"
        });
    }

    db.query("UPDATE venda SET cliente_id=?, data_venda=?, valor_total=? WHERE id=?",
        [cliente_id, data_venda, valor_total, id], (error) => {
            if (error) {
                console.error("Erro na rota PUT /:", error);
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({ message: "Venda Atualizada com Sucesso" });
        });
});

/// Rota para Excluir uma venda por ID

router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    db.query("DELETE FROM vendas WHERE id=?", [id], (error) => {
        if (error) {
            console.error("Erro na rota DELETE /:id:", error);
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({ message: "Venda Excluída Com Sucesso" });
    });
});

module.exports = router;
