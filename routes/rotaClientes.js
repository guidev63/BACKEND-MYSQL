const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Rota para criar um novo cliente
router.post('/', (req, res, next) => {
    const { tipo, genero, nome, cpfcnpj, email, contato, endereco, setor, cidade, uf, cep, complemento } = req.body;

    // Validação dos campos
    if (!tipo || !nome || !cpfcnpj || !email || !contato || !endereco || !cidade || !uf || !cep) {
        console.log("passei aqui ")
        return res.status(400).send({
            mensagem: "Falha ao cadastrar cliente. Verifique os campos obrigatórios."
        });
    }

    // Verifica se o email já está cadastrado
    mysql.getConnection((error, connection) => {
        if (error) {
            console.error(error);
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`SELECT * FROM clientes WHERE email = ?`, [email], (error, results) => {
            if (error) {
                connection.release(); // Liberar conexão em caso de erro
                console.error(error);
                return res.status(500).send({
                    error: error.message
                });
            }

            if (results.length > 0) {
                connection.release(); // Liberar conexão
              
                return res.status(400).send({
                    mensagem: "E-mail já cadastrado para outro cliente."
                });
            }

            // Insere o novo cliente no banco de dados
            connection.query(
                `INSERT INTO clientes (tipo, genero, nome, cpfcnpj, email, contato, endereco, setor, cidade, uf, cep, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [tipo, genero, nome, cpfcnpj, email, contato, endereco, setor, cidade, uf, cep, complemento],
                (insertError, results) => {
                    connection.release(); // Liberar conexão após a inserção

                    if (insertError) {
                        console.error(insertError);
                        return res.status(500).send({
                            error: insertError.message
                        });
                    }
                    res.status(201).send({
                        mensagem: "Cadastro criado com sucesso!",
                        cliente: {
                            id: results.insertId
                        }
                    });
                }
            );
        });
    });
});

// Rota para obter um cliente pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            console.error(error);
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM clientes WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                console.error(error);
                return res.status(500).send({
                    error: error.message
                });
            }

            if (results.length === 0) {
                return res.status(404).send({
                    mensagem: "Cliente não encontrado."
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o cliente solicitado",
                cliente: results[0]
            });
        });
    });
});

// Rota para listar todos os clientes
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            console.error(error);
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM clientes", (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                console.error(error);
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui estão todos os clientes",
                clientes: results
            });
        });
    });
});

module.exports = router;