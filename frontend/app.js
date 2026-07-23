

var ambiente_processo = 'desenvolvimento';
// var ambiente_processo = 'producao';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';


require('dotenv').config({ path: caminho_env });

var express = require('express');
var cors    = require('cors');
var path    = require('path');

var app      = express();
var PORTA    = process.env.APP_PORT;
var HOST     = process.env.APP_HOST;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORTA, function () {
    console.log(`
    ██╗  ██╗ █████╗ ███████╗███████╗
    ██║  ██║██╔══██╗╚══███╔╝██╔════╝
    ███████║███████║  ███╔╝ █████╗  
    ██╔══██║██╔══██║ ███╔╝  ██╔══╝  
    ██║  ██║██║  ██║███████╗███████╗
    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝

    Frontend rodando em: http://${HOST}:${PORTA}
    API esperada em:     ${process.env.API_URL}
    Ambiente:            ${ambiente_processo}
    `);
});
