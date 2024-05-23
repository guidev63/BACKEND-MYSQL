const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
///const bcrypt = require('bcrypt');//
///const jwt = require('jsonwebtoken');//

// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

/// Rota para obter um Produto pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;
     console.log("senhor help!!!!!")
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM produto WHERE id=?", [id], (error, rows) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o Produto solicitado",
                produtos: rows
            });
        });
    });
});

/// Rota para listar todos os Produtos
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            console.error("Erro ao obter conexão:", error.message);
            return res.status(500).send({
                error: "Erro ao obter conexão com o Banco de Dados"
            });
        }

        /// Verifica se a tabela "entrada" existe e, se não existir, a cria
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS entrada (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_produto INT,
                quantidade DECIMAL(10,2),
                valor_unitario DECIMAL(10,2),
                data_entrada DATE,
                FOREIGN KEY (id_produto) REFERENCES produto(id)
            )
        `;

        connection.query(createTableQuery, (error) => {
            if (error) {
                console.error("Erro ao criar tabela 'entrada':", error.message);
                connection.release();
                return res.status(500).send({
                    error: "Erro ao criar tabela 'entrada'"
                });
            }
        });
        /// Consulta para listar todas as entradas
        const selectQuery = `
                SELECT * FROM .produto
            `;

        connection.query(selectQuery, (error, rows) => {
            connection.release(); /// Liberar conexão após consulta

            if (error) {
                console.error("Erro ao executar consulta SQL:", error.message);
                console.log("passei aqui")
                return res.status(500).send({
                    error: "Erro ao executar consulta SQL"
                });
            }



            res.status(200).send({
                mensagem: "Aqui estão todas os Produtos",
                produtos: rows
            });
        });

    });
});

/// Rota para criar um novo Produto
router.post('/', (req, res, next) => {
    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

    /// Validação dos campos
    if (!status || !descricao || !estoque_minimo || !estoque_maximo) {
        return res.status(400).send({
            mensagem: "Todos os campos são Obrigatórios"
        });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("INSERT INTO produto (status, descricao, estoque_minimo, estoque_maximo) VALUES (?, ?, ?, ?)", [status, descricao, estoque_minimo, estoque_maximo], (error, result) => {
            connection.release(); /// Liberar conexão após inserção

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(201).send({
                mensagem: "Produto criado Com Sucesso!",
                produto: {
                    id: result.insertId,
                    status: status,
                    descricao: descricao,
                    estoque_minimo: estoque_minimo,
                    estoque_maximo: estoque_maximo
                }
            });
        });
    });
});

/// Rota para atualizar um Produto existente
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("UPDATE produto SET status=?, descricao=?, estoque_minimo=?, estoque_maximo=? WHERE id=?", [status, descricao, estoque_minimo, estoque_maximo, id], (error, result) => {
            connection.release(); // Liberar conexão após atualização

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Produto atualizado com Sucesso!"
            });
        });
    });
});

// Rota para excluir um Produto pelo ID
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("DELETE FROM produto WHERE id=?", [id], (error, result) => {
            connection.release(); // Liberar conexão após exclusão

            if (error) {
                console.log("passei aqui")
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Produto excluído com Sucesso!"
            });
        });
    });
});

module.exports = router;