const bcrypt = require('bcrypt');

// Senha que você deseja criptografar
const senha = 'senha1234';

// Número de rounds de salting (quanto mais rounds, mais seguro, mas mais lento)
const saltRounds = 10;

// Gerar a senha criptografada
bcrypt.hash(senha, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error('Erro ao gerar a senha criptografada:', err);
  } else {
    console.log('Senha criptografada:', hashedPassword);
  }
});
