document.addEventListener('DOMContentLoaded', () => {
  const adminLoginContainer = document.getElementById('adminLoginContainer');
  const adminPanel = document.getElementById('adminPanel');
  const usersList = document.getElementById('users');
  const productsList = document.getElementById('products');
  const addProductButton = document.getElementById('addProductButton');
  const logoutButton = document.getElementById('logoutButton');
  const backLink = document.getElementById('backLink'); // Referência à div de voltar
  let isAdmin = false;

  // Verificar se o estado do administrador está salvo no LocalStorage
  const savedAdmin = JSON.parse(localStorage.getItem('admin'));

  if (savedAdmin) {
    isAdmin = true;
    adminLoginContainer.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    backLink.classList.add('hidden'); // Ocultar o link de voltar
    loadUsers();
    loadProducts();
  } else {
    isAdmin = false;
  }

  // Login do administrador
  document.getElementById('adminLoginForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, privilegedAccess: true }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isMaster) {
          isAdmin = true;
          // Salvar o estado do administrador no LocalStorage
          localStorage.setItem('admin', JSON.stringify(data));
          adminLoginContainer.classList.add('hidden');
          adminPanel.classList.remove('hidden');
          backLink.classList.add('hidden'); // Ocultar o link de voltar após login
          loadUsers();
          loadProducts();
        } else {
          document.getElementById('loginError').textContent =
            'Acesso negado! Apenas usuários administradores podem acessar.';
          document.getElementById('loginError').classList.remove('hidden');
        }
      })
      .catch((error) => {
        console.error('Erro no login administrativo:', error);
        document.getElementById('loginError').textContent = 'Erro ao processar login.';
        document.getElementById('loginError').classList.remove('hidden');
      });
  });

  // Carregar a lista de usuários
  function loadUsers() {
    fetch('http://localhost:3000/users')
      .then((response) => response.json())
      .then((data) => {
        usersList.innerHTML = '';
        data.forEach((user) => {
          const userElement = document.createElement('li');
          userElement.textContent = `${user.name} - ${user.email}`;
          if (!user.is_master) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', () => deleteUser(user.id));
            userElement.appendChild(deleteButton);
          }
          usersList.appendChild(userElement);
        });
      })
      .catch((error) => console.error('Erro ao carregar usuários:', error));
  }

  // Carregar a lista de produtos
  function loadProducts() {
    fetch('http://localhost:3000/products')
      .then((response) => response.json())
      .then((data) => {
        productsList.innerHTML = '';
        data.forEach((product) => {
          const productElement = document.createElement('li');
          productElement.textContent = `${product.name} - R$ ${parseFloat(product.value).toFixed(2)}`;
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Excluir';
          deleteButton.addEventListener('click', () => deleteProduct(product.id));
          productElement.appendChild(deleteButton);
          productsList.appendChild(productElement);
        });
      })
      .catch((error) => console.error('Erro ao carregar produtos:', error));
  }

  // Adicionar um novo produto
  addProductButton.addEventListener('click', () => {
    const productName = prompt('Digite o nome do produto:');
    let productValue = prompt('Digite o valor do produto:');
  
    // Remover separadores de milhar e converter vírgula em ponto
    productValue = parseFloat(productValue.replace(/\./g, '').replace(',', '.'));
  
    // Validar se o nome e o valor são válidos
    if (productName && !isNaN(productValue)) {
      fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, value: productValue }),
      })
        .then(() => {
          alert('Produto adicionado com sucesso!');
          loadProducts(); // Recarregar a lista de produtos
        })
        .catch((error) => console.error('Erro ao adicionar produto:', error));
    } else {
      alert('Nome ou valor do produto inválido!');
    }
  });
  
  // Excluir um usuário
  function deleteUser(userId) {
    fetch(`http://localhost:3000/users/${userId}`, {
      method: 'DELETE',
    })
      .then(() => {
        alert('Usuário excluído com sucesso!');
        loadUsers();
      })
      .catch((error) => console.error('Erro ao excluir usuário:', error));
  }

  // Excluir um produto
  function deleteProduct(productId) {
    fetch(`http://localhost:3000/products/${productId}`, {
      method: 'DELETE',
    })
      .then(() => {
        alert('Produto excluído com sucesso!');
        loadProducts();
      })
      .catch((error) => console.error('Erro ao excluir produto:', error));
  }

  // Logout do administrador
  logoutButton.addEventListener('click', () => {
    isAdmin = false;
    // Exibir o link de voltar após logout
    backLink.classList.remove('hidden');
    // Remover as credenciais do administrador do LocalStorage
    localStorage.removeItem('admin');
    adminPanel.classList.add('hidden');
    adminLoginContainer.classList.remove('hidden');
  });
});
