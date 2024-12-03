# TechShop

TechShop é uma aplicação web para gestão de uma loja virtual, com funcionalidades de cadastro e login de usuários, gerenciamento de produtos e um painel administrativo exclusivo para administradores.

## Funcionalidades

### Usuários
- Cadastro de novos usuários com validação de dados.
- Login com persistência de sessão utilizando `localStorage`.
- Gerenciamento de carrinho de compras:
  - Adição e remoção de produtos.
  - Finalização de compras.

### Administradores
- Login exclusivo para administradores.
- Gerenciamento de usuários cadastrados.
- Adição, listagem e exclusão de produtos no sistema.

## Tecnologias Utilizadas

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript**
- **Font Awesome** (para ícones)

### Backend
- **Node.js** com Express
- **PostgreSQL** para persistência de dados
- **Bcrypt** para hashing de senhas
- **CORS** para requisições seguras entre domínios
- **Body-Parser** para manipulação de requisições HTTP

## Estrutura do Projeto

```plaintext
InovaStore/
|
├── server.js               # Arquivo principal do servidor Node.js
├── package.json            # Gerenciador de dependências e scripts do projeto
├── node_modules/           # Diretório onde ficam os pacotes instalados
├── generate-hashed-password.js # Utilitário para gerar senhas criptografadas
├public/
|   ├── index.html          # Página principal
|   ├── style.css           # Estilos para a página principal
|   ├── script.js           # Lógica de autenticação e carrinho
|   ├── admin.html          # Painel administrativo
|   ├── admin.css           # Estilos para o painel administrativo
|   └── admin.js            # Lógica do painel administrativo
```

## Configuração e Execução

### Pré-requisitos
Certifique-se de ter o seguinte instalado:
- **Node.js** e **npm**
- **PostgreSQL**

### Banco de Dados
1. Crie um banco de dados chamado `TechShop`.
2. Execute os seguintes comandos SQL para configurar as tabelas:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  birthdate DATE,
  is_master BOOLEAN DEFAULT FALSE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value NUMERIC(10, 2) NOT NULL
);
```

### Configuração do Projeto
1. Clone o repositório:
   ```bash
   git clone https://github.com/Hendrwey/TechShop.git
   cd inovastore
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o acesso ao banco de dados no arquivo `server.js` (usuário, senha e porta).

### Executando o Projeto
1. Inicie o servidor:
   ```bash
   node server.js
   ```
2. Acesse [http://localhost:3000](http://localhost:3000) no navegador para a interface principal.

## Utilitário de Hashing
Para gerar senhas criptografadas, utilize o script `generate-hashed-password.js`:
```bash
node generate-hashed-password.js
```

## Melhorias Futuras
- Deployer em produção

