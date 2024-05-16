const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

// Rota para criar um novo serviço
router.post('/', (req, res, next) => {
    const { nome, descricao, quantidade, preco, fornecedor_id } = req.body;

    // Validação dos campos
    if (!nome || !descricao || !quantidade || !preco || !fornecedor_id) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar Serviço. Verifique os campos Obrigatórios."
        });
    }

    // Insere o novo serviço no banco de dados
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`INSERT INTO servicos (nome, descricao, quantidade, preco, fornecedor_id) VALUES (?, ?, ?, ?, ?)`,
            [nome, descricao, quantidade, preco, fornecedor_id],
            (insertError, results) => {
                connection.release(); // Liberar conexão após a inserção

                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message
                    });
                }
                res.status(201).send({
                    mensagem: "Cadastro criado com Sucesso!",
                    servico: {
                        id: results.insertId,
                        nome,
                        descricao,
                        quantidade,
                        preco,
                        fornecedor_id,
                        createAt: results.createAt,
                        updateAt: results.updateAt
                    }
                });
            });
    });
});

// Rota para obter um serviço pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM servicos WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o Serviço Solicitado",
                servico: results[0]
            });
        });
    });
});

// Rota para listar todos os serviços
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM servicos", (error, results) => {
            connection.release(); // Liberar conexão após Consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui Estão Todos os Serviços",
                servicos: results
            });
        });
    });
});

// Outras rotas como atualizar e excluir podem ser adicionadas conforme necessário

module.exports = router;
