const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require('bcrypt');

// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

// Rota para fazer login
router.post('/login', (req, res, next) => {
    const { email, senha } = req.body;

    mysql.getConnection((error, connection) => {
        if (error) {
                        
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM usuario WHERE email = ?", [email], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                console.log(error)
                return res.status(500).send({
                    error: error.message
                });
            }

            if (results.length === 0) {
                return res.status(401).send({
                    mensagem: "Usuário não encontrado."
                });
            }

            const usuario = results[0];

            bcrypt.compare(senha, usuario.senha, (bcryptError, result) => {
                if (bcryptError) {
                    return res.status(500).send({
                        error: bcryptError.message
                    });
                }

                if (!result) {
                    return res.status(401).send({
                        mensagem: "Senha incorreta."
                    });
                }

                res.status(200).send({
                    mensagem: "Login bem sucedido.",
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email
                    }
                });
            });
        });
    });
});

// Rota para obter um usuário pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM usuario WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }

            res.status(200).send({
                mensagem: "Aqui está o usuário solicitado",
                usuario: results[0]
            });
        });
    });
});

// Rota para listar todos os usuários
router.get("/", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT * FROM usuario", (error, results) => {
            connection.release(); // Liberar conexão após Consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({
                mensagem: "Aqui estão todos os usuários",
                usuarios: results
            });
        });
    });
});

// Rota para listar apenas nomes e emails dos usuários
router.get("/nomes", (req, res, next) => {
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("SELECT nome, email FROM usuario", (error, results) => {
            connection.release(); // Liberar conexão após consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send(results);
        });
    });
});

// Rota para criar um novo usuário
router.post('/', (req, res, next) => {
    const { nome, email, senha } = req.body;

    // Validação dos campos
    if (!nome || nome.length < 3 || !email || !validateEmail(email) || !senha || senha.length < 6) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar usuário. Verifique os campos."
        });
    }

    // Verifica se o email já está cadastrado
    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query(`SELECT * FROM usuario WHERE email = ?`, [email], (error, results) => {
            if (error) {
                connection.release(); // Liberar conexão em caso de erro
                return res.status(500).send({
                    error: error.message
                });
            }

            if (results.length > 0) {
                connection.release(); // Liberar conexão
                return res.status(400).send({
                    mensagem: "E-mail já cadastrado."
                });
            }

            // Hash da senha antes de salvar no banco de dados
            bcrypt.hash(senha, 10, (hashError, hashedPassword) => {
                if (hashError) {
                    connection.release(); // Liberar conexão
                    return res.status(500).send({
                        error: hashError.message
                    });
                }

                // Insere o novo usuário no banco de dados
                connection.query(`INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)`, [nome, email, hashedPassword], (insertError, results) => {
                    connection.release(); // Liberar conexão após a inserção

                    if (insertError) {
                        return res.status(500).send({
                            error: insertError.message
                        });
                    }
                    res.status(201).send({
                        mensagem: "Cadastro criado com sucesso!",
                        usuario: {
                            id: results.insertId,
                            nome: nome,
                            email: email
                        }
                    });
                });
            });
        });
    });
});

// Função para validar formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Rota para atualizar um usuário existente
router.put("/", (req, res, next) => {
    const { id, nome, email, senha } = req.body;

    if (!id || !nome || !email || !senha) {
        return res.status(400).send({ error: "Parâmetros inválidos" });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("UPDATE usuario SET nome=?, email=?, senha=? WHERE id=?", [nome, email, senha, id], (error, results) => {
            connection.release(); // Liberar conexão após a consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({ mensagem: SUCCESS_MESSAGE });
        });
    });
});

// Rota para excluir um usuário pelo ID
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({ error: "Parâmetros inválidos" });
    }

    mysql.getConnection((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        connection.query("DELETE FROM usuario WHERE id=?", [id], (error, results) => {
            connection.release(); // Liberar conexão após a consulta

            if (error) {
                return res.status(500).send({
                    error: error.message
                });
            }
            res.status(200).send({ mensagem: SUCCESS_MESSAGE });
        });
    });
});

module.exports = router;
