const express = require("express");
const router = express.Router();
const db = require("../mysql").pool;

// Configuração do pool de conexões MySQL


// Rota para obter uma saída específica por ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    db.query("SELECT * FROM saida WHERE id=?", [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        if (rows.length === 0) {
            return res.status(404).send({
                message: "Saída não Encontrada"
            });
        }

        res.status(200).send({
            message: "Aqui está a saída Solicitada",
            saida: rows[0]
        });
    });
});

// Rota para obter todas as saídas com informações adicionais dos produtos
router.get("/", (req, res, next) => {
    db.query(`SELECT
                    saida_produto.id as id,
                    saida_produto.id_produto as id_produto,
                    saida_produto.quantidade as quantidade,
                    saida_produto.valor_unitario as valor_unitario,
                    saida_produto.data_saida as data_saida,
                    produto.descricao as descricao
                FROM saida_produto 
                INNER JOIN produto 
                ON saida_produto.id_produto = produto.id`, (error, rows) => {
        if (error) {
            console.error("Erro na rota GET /:", error);
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            message: "Aqui está a lista de todas as Saídas",
            saidas: rows
        });
    });
});

// Rota para criar uma nova saída
router.post('/', (req, res, next) => {
    const { id_produto, quantidade, valor_unitario, data_saida } = req.body;

    if (!id_produto || !quantidade || !valor_unitario || !data_saida) {
        return res.status(400).send({
            message: "Parâmetros inválidos"
        });
    }

    db.query(`INSERT INTO saida_produto (id_produto, quantidade, valor_unitario, data_saida) VALUES (?, ?, ?, ?)`,
        [id_produto, quantidade, valor_unitario, data_saida], (error, results) => {
            if (error) {
                console.error("Erro na rota POST /:", error);
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(201).send({
                message: "Saída criada com Sucesso!",
                saida: {
                    id: results.insertId,
                    id_produto,
                    quantidade,
                    valor_unitario,
                    data_saida
                }
            });
        });
});

// Rota para atualizar uma saída existente
router.put("/", (req, res, next) => {
    const { id, id_produto, quantidade, valor_unitario, data_saida } = req.body;

    if (!id_produto || !quantidade || !valor_unitario || !data_saida) {
        return res.status(400).send({
            message: "Parâmetros inválidos"
        });
    }

    db.query("UPDATE saida SET id_produto=?, quantidade=?, valor_unitario=?, data_saida=? WHERE id=?",
        [id_produto, quantidade, valor_unitario, data_saida, id], (error) => {
            if (error) {
                console.error("Erro na rota PUT /:", error);
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({ message: "Sucesso" });
        });
});

// Rota para excluir uma saída por ID
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    db.query("DELETE FROM saida_produto WHERE id=?", id, (error) => {
        if (error) {
            console.error("Erro  na  rota DELETE /:id:", error);
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({ message: "Sucesso" });
    });
});

module.exports = router;
