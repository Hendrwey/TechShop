const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'TechShop',
  password: '159753',
  port: 5432,
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Rota de cadastro
app.post('/register', async (req, res) => {
  const { name, email, password, phone, birthdate } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      'INSERT INTO users (name, email, password, phone, birthdate) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashedPassword, phone, birthdate]
    );
    res.status(201).send('Usuário cadastrado com sucesso!');
  } catch (err) {
    res.status(500).send('Erro ao cadastrar o usuário.');
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { username, password, privilegedAccess } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (await bcrypt.compare(password, user.password)) {
        // Caso seja um administrador tentando login comum
        if (user.is_master && !privilegedAccess) {
          return res.status(403).json({
            message: 'Usuários administradores só podem acessar pelo painel administrativo.',
          });
        }
        // Login bem-sucedido
        res.status(200).json({
          message: 'Login bem-sucedido!',
          user,
          isMaster: user.is_master,
        });
      } else {
        // Senha incorreta
        res.status(401).json({ message: 'Senha incorreta!' });
      }
    } else {
      // Usuário não encontrado
      res.status(404).json({ message: 'Usuário não encontrado!' });
    }
  } catch (err) {
    // Erro geral do servidor
    res.status(500).json({ message: 'Erro ao realizar login.' });
  }
});

// Rota para buscar todos os produtos
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).send('Erro ao buscar produtos.');
  }
});

// Rota para buscar todos os usuários
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, is_master FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).send('Erro ao buscar usuários.');
  }
});

// Rota para excluir um usuário (somente não administradores)
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 AND is_master = FALSE', [id]);
    if (result.rowCount > 0) {
      res.status(200).send('Usuário excluído com sucesso!');
    } else {
      res.status(400).send('Usuário não pode ser excluído (ou é administrador).');
    }
  } catch (err) {
    res.status(500).send('Erro ao excluir usuário.');
  }
});

// Rota para excluir um produto
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      res.status(200).send('Produto excluído com sucesso!');
    } else {
      res.status(404).send('Produto não encontrado.');
    }
  } catch (err) {
    res.status(500).send('Erro ao excluir produto.');
  }
});

// Rota para adicionar um produto
app.post('/products', async (req, res) => {
  const { name, value } = req.body;

  // Converta o valor para um número com precisão correta
  const productValue = parseFloat(value);

  if (isNaN(productValue)) {
    return res.status(400).send('Valor inválido!');
  }

  try {
    await pool.query('INSERT INTO products (name, value) VALUES ($1, $2)', [
      name,
      productValue,
    ]);
    res.status(201).send('Produto adicionado com sucesso!');
  } catch (err) {
    res.status(500).send('Erro ao adicionar produto.');
  }
});


app.listen(3000, () => {
  console.log('InovaStore rodando na porta 3000');
});
