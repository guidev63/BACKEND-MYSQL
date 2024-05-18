const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;


// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";


// Rota para criar um novo checklist
router.post('/', (req, res, next) => {
    const { ordem_de_servico_id, item_checklist_id, status, observacao } = req.body;


    // Validação dos campos
    if (!ordem_de_servico_id || !item_checklist_id || !status) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar Checklist. Verifique os campos Obrigatórios."
        });
    }


    // Insere o novo checklist no banco de dados
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`INSERT INTO checklist_ordem_servico (ordem_de_servico_id, item_checklist_id, status, observacao) VALUES (?, ?, ?, ?)`,
            [ordem_de_servico_id, item_checklist_id, status, observacao],
            (insertError, results) => {
                connection.release(); // Liberar conexão após a inserção

                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message
                    });
                }
                res.status(201).send({
                    mensagem: "Checklist criado com Sucesso!",
                    checklist: {
                        id: results.insertId,
                        ordem_de_servico_id,
                        item_checklist_id,
                        status,
                        observacao
                    }
                });
            });
    });
});

// Rota para obter um checklist pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM checklist_ordem_servico WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o Checklist Solicitado",
                checklist: results[0]
            });
        });
    });
});

// Rota para listar todos os checklists
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM checklist_ordem_servico", (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui Estão Todos Os Checklists",
                checklist: results
            });
        });
    });
});


// Outras rotas como atualizar e excluir podem ser adicionadas conforme necessário

module.exports = router;
