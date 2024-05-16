const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

// Rota para criar um novo fornecedor
router.post('/', (req, res, next) => {
    const { tipo, genero, nome, cpfcnpj, email, contato, endereco, setor, cidade, uf, cep, complemento } = req.body;

    // Validação dos campos
    if (!tipo || !nome || !cpfcnpj || !email || !contato || !endereco || !cidade || !uf || !cep) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar Fornecedor. Verifique os campos Obrigatórios."
        });
    }

    // Verifica se o email já está cadastrado
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`SELECT * FROM fornecedores WHERE email = ?`, [email], (error, results) => {
            if (error) {
                connection.release(); // Liberar conexão em caso de erro
                return res.status(500).send({
                    error: error.message
                });
            }

            if (results.length > 0) {
                connection.release(); // Liberar conexão
                return res.status(400).send({
                    mensagem: "E-mail já Cadastrado Para outro Fornecedor."
                });
            }

            // Insere o novo fornecedor no banco de dados
            connection.query(`INSERT INTO fornecedores (tipo, genero, nome, cpfcnpj, email, contato, endereco, setor, cidade, uf, cep, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [tipo, genero, nome, cpfcnpj, email, contato, endereco, setor, cidade, uf, cep, complemento],
                (insertError, results) => {
                    connection.release(); // Liberar conexão após a inserção

                    if (insertError) {
                        return res.status(500).send({
                            error: insertError.message
                        });
                    }
                    res.status(201).send({
                        mensagem: "Cadastro criado com Sucesso!",
                        fornecedor: {
                            id: results.insertId,
                            tipo,
                            genero,
                            nome,
                            cpfcnpj,
                            email,
                            contato,
                            endereco,
                            setor,
                            cidade,
                            uf,
                            cep,
                            complemento
                        }
                    });
                });
        });
    });
});

// Rota para obter um fornecedor pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM fornecedores WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o Fornecedor Solicitado",
                fornecedores: results[0]
            });
        });
    });
});

// Rota para listar todos os fornecedores
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM fornecedores", (error, results) => {
            connection.release(); // Liberar conexão após Consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui Estão Todos os Fornecedores",
                fornecedores: results
            });
        });
    });
});

// Outras rotas como atualizar e excluir podem ser adicionadas conforme necessário

module.exports = router;