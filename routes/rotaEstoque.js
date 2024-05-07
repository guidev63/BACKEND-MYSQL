const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

router.get("/", (req, res, next) => {
    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`
            SELECT 
                estoque.id AS id,
                estoque.quantidade AS quantidade,
                estoque.valor_unitario AS valor_unitario,
                produto.id AS id_produto,
                produto.descricao AS descricao
            FROM estoque
            INNER JOIN produto ON estoque.id_produto = produto.id;
        `, (queryError, rows) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao executar consulta:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(200).send({
                message: "Aqui está a lista de Estoque",
                estoque: rows
            });
        });
    });
});
router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`
            SELECT 
                estoque.id AS id,
                estoque.quantidade AS quantidade,
                estoque.valor_unitario AS valor_unitario,
                produto.id AS id_produto,
                produto.descricao AS descricao
            FROM estoque
            INNER JOIN produto ON estoque.id_produto = produto.id where id_produto
            =?
        `, [id], (queryError, rows) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao executar consulta:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(200).send({
                message: "Aqui está a Lista de Estoque",
                estoque: rows
            });
        });
    });
});

router.post("/", (req, res) => {
    const { id_produto, quantidade, valor_unitario } = req.body;

    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`INSERT INTO estoque (id_produto, quantidade, valor_unitario) VALUES (?, ?, ?)`, [id_produto, quantidade, valor_unitario], (queryError, result) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao inserir no Estoque:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(201).send({
                message: "Estoque Registrado!",
                estoque: {
                    id: result.insertId,
                    id_produto: id_produto,
                    quantidade: quantidade,
                    valor_unitario: valor_unitario
                }
            });
        });
    });
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { id_produto, quantidade, valor_unitario } = req.body;

    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`UPDATE estoque SET id_produto=?, quantidade=?, valor_unitario=? WHERE id=?`, [id_produto, quantidade, valor_unitario, id], (queryError, result) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao atualizar estoque:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(200).send({
                message: "Estoque Atualizado com Sucesso!"
            });
        });
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;

    mysql.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err.message);
            return res.status(500).send({
                error: err.message
            });
        }

        connection.query(`DELETE FROM estoque WHERE id=?`, [id], (queryError, result) => {
            connection.release();

            if (queryError) {
                console.error('Erro ao excluir do estoque:', queryError.message);
                return res.status(500).send({
                    error: queryError.message
                });
            }

            res.status(200).send({
                message: "Estoque Excluído com Sucesso!"
            });
        });
    });
});

module.exports = router;
