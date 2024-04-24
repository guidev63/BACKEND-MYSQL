const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
//const bcrypt = require('bcrypt');//
//const jwt = require('jsonwebtoken');//

// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

// Rota para obter uma Entrada pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM entrada WHERE id=?", [id], (error, rows) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está a Entrada Solicitada",
                entrada: rows
            });
        });
    });
});

// Rota para listar todas as entradas
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            console.error("Erro ao obter conexão:", error.message);
            console.log("passei aqui")
            return res.status(500).send({
                error: "Erro ao obter conexão com o banco de dados"
            });
        }

        const query = `
            SELECT 
                entrada.id AS id,
                entrada.id_produto AS id_produto,
                entrada.quantidade AS quantidade,
                produto.descricao AS descricao,
                entrada.data_entrada AS data_entrada,
                entrada.valor_unitario AS valor_unitario
            FROM entrada 
            INNER JOIN produto ON entrada.id_produto = produto.id
        `;

        connection.query(query, (error, rows) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                console.error("Erro ao executar consulta SQL:", error.message);
                return res.status(500).send({
                    error: "Erro ao executar consulta SQL"
                });
            }

            if (rows.length === 0) {
                return res.status(404).send({
                    mensagem: "Não foram encontradas entradas"
                });
            }

            res.status(200).send({
                mensagem: "Aqui estão todas as Entradas",
                entradas: rows
            });
        });
    });
});


// Rota para criar uma nova entrada
router.post('/', (req, res, next) => {
    const { id_produto, quantidade, valor_unitario, data_entrada } = req.body;

    // Validação dos campos
    if (!id_produto || !quantidade || !valor_unitario || !data_entrada) {
        return res.status(400).send({
            mensagem: "Todos os campos são obrigatórios"
        });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        const query = "INSERT INTO entrada (id_produto, quantidade, valor_unitario, data_entrada) VALUES (?, ?, ?, ?)";
        const values = [id_produto, quantidade, valor_unitario, data_entrada];


        connection.query(query, values, (error, result) => {
            connection.release(); // Liberar conexão após inserção

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(201).send({
                mensagem: "Entrada criada com sucesso!",
                entrada: {
                    id: result.insertId,
                    id_produto: id_produto,
                    quantidade: quantidade,
                    valor_unitario: valor_unitario,
                    data_entrada: data_entrada
                }
            });
        });
    });
});

// Rota para atualizar uma entrada existente
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    const { id_produto, quantidade, valor_unitario, data_entrada } = req.body;

    if (!id_produto || !quantidade || !valor_unitario || !data_entrada) {
        return res.status(400).send({ error: "Parâmetros inválidos" });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        const query = "UPDATE entrada SET id_produto=?, quantidade=?, valor_unitario=?, data_entrada=? WHERE id=?";
        const values = [id_produto, quantidade, valor_unitario, data_entrada, id];

        connection.query(query, values, (error, result) => {
            connection.release(); // Liberar conexão após atualização

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Entrada atualizada com sucesso!"
            });
        });
    });
});

// Rota para excluir uma entrada pelo ID
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        const query = "DELETE FROM entrada WHERE id=?";
        const values = [id];

        connection.query(query, values, (error, result) => {
            connection.release(); // Liberar conexão após exclusão

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Entrada excluída com sucesso!"
            });
        });
    });
});

module.exports = router;