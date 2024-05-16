const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(cors());
const bodyParser = require('body-parser');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/uploads', express.static('./uploads'));
app.use('/assets', express.static('./assets'));



//rotas


const rotaUsuario = require("./routes/rotaUsuario");
const rotaProduto = require("./routes/rotaProduto");
const rotaEntrada = require("./routes/rotaEntrada");
const rotaSaida = require("./routes/rotaSaida");
const rotaEstoque = require("./routes/rotaEstoque");
const rotaCientes = require("./routes/rotaClientes");
const rotaFornecedores = require("./routes/rotaFornecedores");
const rotaServicos = require("./routes/rotaServicos");

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, PATCH, DELETE, GET");
        return res.status(200).send({});
    }
    next();
});




app.use("/usuario", rotaUsuario);
app.use("/produtos", rotaProduto);
app.use("/entrada", rotaEntrada);
app.use("/saida", rotaSaida);
app.use("/estoque", rotaEstoque);
app.use("/clientes",rotaCientes)
app.use("/fornecedores",rotaFornecedores)
app.use("/servicos",rotaServicos)




app.use((req, res, next) => {
    const erro = new Error("Não encontrado!");
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.json({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app; // corrigido de "module.exports = app pfvr" para "module.exports = app;"
