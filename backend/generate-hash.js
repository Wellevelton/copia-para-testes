const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 12);
  console.log('Senha:', password);
  console.log('Hash:', hash);
  
  // Testar se o hash funciona
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash válido:', isValid);
}

generateHash();

