const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

// Rota para criar um novo faturamento
router.post('/', (req, res, next) => {
    const { ordem_de_servico_id, venda_id, valor_total, data_faturamento } = req.body;

    // Validação dos campos
    if (!ordem_de_servico_id || !venda_id || !valor_total || !data_faturamento) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar faturamento. Verifique os campos obrigatórios."
        });
    }

    // Insere o novo faturamento no banco de dados
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`INSERT INTO faturamento (ordem_de_servico_id, venda_id, valor_total, data_faturamento) VALUES (?, ?, ?, ?)`,
            [ordem_de_servico_id, venda_id, valor_total, data_faturamento],
            (insertError, results) => {
                connection.release(); // Liberar conexão após a inserção

                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message
                    });
                }
                res.status(201).send({
                    mensagem: "Cadastro criado com sucesso!",
                    faturamento: {
                        id: results.insertId,
                        ordem_de_servico_id,
                        venda_id,
                        valor_total,
                        data_faturamento
                    }
                });
            });
    });
});

// Rota para obter um faturamento pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM faturamento WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).send({
                    mensagem: "Faturamento não encontrado."
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o faturamento solicitado",
                faturamento: results[0]
            });
        });
    });
});

// Rota para listar todos os faturamentos
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM faturamento", (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui estão todos os faturamentos",
                faturamento: results
            });
        });
    });
});

// Outras rotas como atualizar e excluir podem ser adicionadas conforme necessário

module.exports = router;
