const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

// Rota para registrar um novo pagamento
router.post('/', (req, res, next) => {
    const { faturamento_id, valor_pago, data_pagamento } = req.body;

    // Validação dos campos
    if (!faturamento_id || !valor_pago || !data_pagamento) {
        return res.status(400).send({
            mensagem: "Falha Ao registrar Pagamento. Verifique os Campos Obrigatórios."
        });
    }

    // Insere o novo pagamento no banco de dados
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`INSERT INTO pagamentos (faturamento_id, valor_pago, data_pagamento) VALUES (?, ?, ?)`,
            [faturamento_id, valor_pago, data_pagamento],
            (insertError, results) => {
                connection.release(); // Liberar conexão após a inserção

                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message
                    });
                }
                res.status(201).send({
                    mensagem: "Pagamento registrado com sucesso!",
                    pagamento: {
                        id: results.insertId,
                        faturamento_id,
                        valor_pago,
                        data_pagamento
                    }
                });
            });
    });
});

// Rota para obter um pagamento pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM pagamentos WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o pagamento solicitado",
                pagamento: results[0]
            });
        });
    });
});

// Rota para listar todos os pagamentos
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM pagamentos", (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui estão todos os pagamentos",
                pagamentos: results
            });
        });
    });
});

// Outras rotas como atualizar e excluir podem ser adicionadas conforme necessário

module.exports = router;
