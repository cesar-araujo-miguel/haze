# 🎮 HAZE — Rede Social para Artes e Jogos

[![Java Version](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg?style=flat-square)](LICENSE)

> **Projeto Individual — Programação Web**  
> Aplicação web full-stack focada na comunidade de desenvolvimento de jogos, contemplando autenticação de usuários, cadastros dinâmicos e integração completa via API REST.

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura & Tecnologias](#-arquitetura--tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
- [Executando a Aplicação](#-executando-a-aplicação)
  - [1. Back-end (Spring Boot)](#1-back-end-spring-boot)
  - [2. Front-end (Node.js/Express)](#2-front-end-nodejs-express)
  - [Ordem e Portas de Execução](#ordem-e-portas-de-execução)
- [Endpoints da API](#-endpoints-da-api)
- [Requisitos Técnicos & Diretrizes](#-requisitos-técnicos--diretrizes)
  - [Front-end](#front-end)
  - [Back-end](#back-end)
  - [Regras e Restrições](#regras-e-restrições)
- [Configurações do Ambiente](#-configurações-do-ambiente)

---

## 📝 Visão Geral

O **HAZE** é uma plataforma voltada para entusiastas e desenvolvedores de jogos eletrônicos. O sistema permite o cadastro completo de usuários com validações dinâmicas no client-side, consumo de dados assíncronos do servidor (populando seletores dinâmicos) e persistência segura em banco de dados relacional.

O projeto foi construído para demonstrar os conceitos fundamentais de integração web sem a utilização de frameworks pesados no client-side, priorizando a performance e a compressão sólida dos conceitos de manipulação de DOM, requisições HTTP assíncronas (`fetch` API) e arquitetura em camadas com Spring Boot (Spring JDBC).

---

## 🚀 Arquitetura & Tecnologias

### **Front-end**
- **Linguagens:** HTML5, CSS3 e JavaScript Vanilla (ES6+).
- **Servidor Estático:** Node.js com Express.
- **Diretriz:** Sem frameworks (React, Vue, Angular) ou bibliotecas de UI (Bootstrap, Tailwind, jQuery).

### **Back-end**
- **Linguagem:** Java 21 (LTS).
- **Framework:** Spring Boot 3.x.
- **Acesso a Dados:** Spring JDBC (`JdbcTemplate`).
- **Banco de Dados:** MySQL 8.0+.

---

## 📂 Estrutura do Repositório

```text
.
├── frontend/
│   ├── app.js                   # Servidor de arquivos estáticos (Express)
│   ├── package.json             # Dependências do Front-end
│   └── public/
│       ├── index.html           # Página principal
│       ├── css/                 # Estilos customizados
│       ├── js/                  # Scripts e integrações com API (fetch)
│       └── assets/              # Imagens e recursos estáticos
│
├── backend/
│   └── src/
│       └── main/
│           ├── java/school/sptech/projetoindividual/
│           │   ├── controller/  # Controladores REST (@RestController, @CrossOrigin)
│           │   └── model/       # Modelos de dados / DTOs
│           └── resources/
│               ├── application.properties  # Configuração de conexão e ambiente
│               └── haze.sql               # Script de criação e carga inicial do banco
│
└── README.md
```

---

## 💻 Pré-requisitos

Antes de iniciar, certifique-se de ter os seguintes recursos instalados em sua máquina:

| Ferramenta | Versão Mínima | Download |
| :--- | :--- | :--- |
| **Java JDK** | 21 ou superior | [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/) |
| **Node.js** | v18.0.0 ou superior | [Node.js Official](https://nodejs.org/) |
| **MySQL Server** | 8.0 ou superior | [MySQL Community Server](https://dev.mysql.com/downloads/) |

---

## 🗄️ Configuração do Banco de Dados

1. Certifique-se de que o serviço do MySQL está em execução.
2. Execute o script DDL/DML localizado em `backend/src/main/resources/haze.sql`.

*Exemplo via MySQL CLI:*
```bash
mysql -u seu_usuario -p < backend/src/main/resources/haze.sql
```

O script criará automaticamente o schema da aplicação, as tabelas necessárias e os dados iniciais.

---

## ⚙️ Executando a Aplicação

> ⚠️ **IMPORTANTE:** Sempre inicie o **Back-end** antes do **Front-end** para garantir que os dados dinâmicos do formulário estejam disponíveis na inicialização.

### 1. Back-end (Spring Boot)

1. Acesse o diretório do back-end:
   ```bash
   cd backend
   ```

2. Configure suas credenciais de banco de dados no arquivo `src/main/resources/application.properties` caso necessário:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/haze?useSSL=false&serverTimezone=UTC
   spring.datasource.username=seu_usuario
   spring.datasource.password=sua_senha
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   ```

3. Inicie o servidor Spring Boot:
   - **Linux / macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
   - **Windows:**
     ```cmd
     mvnw.cmd spring-boot:run
     ```

O servidor do back-end estará disponível em: **`http://localhost:8080`**

---

### 2. Front-end (Node.js/Express)

1. Abra um novo terminal e acesse a pasta do front-end:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor estático:
   ```bash
   npm start
   ```

A aplicação web estará acessível em: **`http://localhost:3000`**

---

### Ordem e Portas de Execução

| Ordem | Componente | Tecnologia | Diretorio | Porta |
| :---: | :--- | :--- | :--- | :---: |
| **1º** | Back-end API | Spring Boot / Java 21 | `backend/` | `8080` |
| **2º** | Front-end Web | Node.js / Express | `frontend/` | `3000` |

---

## 🔌 Endpoints da API

Abaixo estão listados os endpoints REST expostos pelo servidor Spring Boot:

| Método | Rota | Descrição | Status de Retorno |
| :---: | :--- | :--- | :---: |
| <span style="color:green; font-weight:bold;">GET</span> | `/jogos` | Retorna a lista de jogos para popular o `<select>` dinâmico | `200 OK` |
| <span style="color:blue; font-weight:bold;">POST</span> | `/usuarios/cadastrar` | Registra um novo usuário no banco de dados | `201 Created` / `400 Bad Request` |
| <span style="color:blue; font-weight:bold;">POST</span> | `/usuarios/autenticar` | Realiza a autenticação de um usuário existente | `200 OK` / `401 Unauthorized` |

---

## 🛠️ Requisitos Técnicos & Diretrizes

### Front-end
- **Formulários Interativos:** Inclui entradas do tipo texto, numérico, data, radio buttons, checkboxes e menu dropdown (`<select>`).
- **Carga Dinâmica:** O elemento `<select>` é alimentado via requisição assíncrona (`fetch`) consumindo a rota `GET /jogos`.
- **Validação Client-side:** Lógica customizada em JavaScript Vanilla para validação de formato e preenchimento dos campos antes de enviar o payload via `POST`.

### Back-end
- **Persistência com Spring JDBC:** Injeção do `JdbcTemplate` para execução otimizada de comandos SQL sem acoplamento excessivo.
- **Validação Server-side & Respostas HTTP:**
  - `201 Created`: Enviado quando a entidade é validada e gravada com sucesso.
  - `400 Bad Request`: Retornado caso ocorram falhas nas validações de regras de negócio ou estrutura do JSON.
- **CORS:** Configuração da anotação `@CrossOrigin` nos Controllers para liberação de requisições provenientes da origem do front-end (`http://localhost:3000`).

### Regras e Restrições
1. **Back-end:** Não é permitida a adição de dependências externas além das configuradas inicialmente no projeto Spring Boot.
2. **Front-end:** Estritamente proibida a utilização de frameworks (React, Vue, Angular, etc.) ou bibliotecas CSS/JS (Bootstrap, Tailwind, jQuery, etc.). Toda a construção deve utilizar **HTML5, CSS3 e JS Vanilla puros**.

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos como parte da avaliação individual da disciplina de Programação Web. Todos os direitos reservados.
