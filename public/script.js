document.addEventListener('DOMContentLoaded', function () {
  let isLoggedIn = false; // Variável para verificar se o usuário está logado
  let isAdmin = false; // Variável para verificar se o usuário é administrador

  // Exibir o formulário de login
  function showLoginForm() {
    isLoggedIn = false; // Redefine o estado de login
    isAdmin = false; // Redefine o estado de administrador
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loggedIn').classList.add('hidden');
    document.getElementById('productsContainer').style.display = 'none';
    document.getElementById('cartContainer').classList.add('hidden');
  }

  // Exibir o formulário de cadastro
  function showRegisterForm() {
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('loggedIn').classList.add('hidden');
    document.getElementById('productsContainer').style.display = 'none';
    document.getElementById('cartContainer').classList.add('hidden');
  }

  // Exibir o nome do usuário logado
  function showLoggedInUser(username) {
    isLoggedIn = true; // Define que o usuário está logado
    document.getElementById('userName').textContent = username;
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loggedIn').classList.remove('hidden');
  }

  // Cadastro de novo usuário
  document
    .getElementById('registerForm')
    .querySelector('form')
    .addEventListener('submit', function (event) {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const birthdate = document.getElementById('birthdate').value;

      if (!name || !email || !password || !phone || !birthdate) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone, birthdate }),
      })
        .then((response) => response.text())
        .then((data) => {
          alert(data);
          showLoginForm(); // Volta para a tela de login após o cadastro
        })
        .catch((error) => {
          console.error('Erro ao cadastrar o usuário:', error);
          alert('Erro ao cadastrar o usuário.');
        });
    });

  // Login de usuário
  document
    .getElementById('loginForm')
    .querySelector('form')
    .addEventListener('submit', function (event) {
      event.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      if (!username || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, privilegedAccess: false }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData.message);
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data.isMaster && !data.privilegedAccess) {
            alert('Usuários administradores só podem acessar pelo painel administrativo.');
            showLoginForm();
          } else {
            alert(data.message);
            showLoggedInUser(username);
            loadProducts();
            document.getElementById('productsContainer').style.display = 'block';

            // Salvar estado do login no localStorage
            localStorage.setItem('user', JSON.stringify(data));
          }
        })
        .catch((error) => {
          alert(error.message);
          console.error('Erro ao fazer login:', error);
        });
    });

  // Verificar o estado do login ao carregar a página
  const savedUser = JSON.parse(localStorage.getItem('user'));

  if (savedUser) {
    // Restaurar o estado de login se houver dados no localStorage
    showLoggedInUser(savedUser.user.name);
    loadProducts();
    document.getElementById('productsContainer').style.display = 'block';
    isAdmin = savedUser.isMaster; // Define se o usuário é administrador
  } else {
    showLoginForm(); // Exibir o formulário de login
  }

  // Logout de usuário
  document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('user'); // Remove os dados do usuário do localStorage
    alert('Você saiu da conta.');
    showLoginForm();
  });

  // Alternar entre os formulários de login e cadastro
  document
    .getElementById('showRegisterFormButton')
    .addEventListener('click', showRegisterForm);
  document
    .getElementById('showLoginFormButton')
    .addEventListener('click', showLoginForm);

  // Função para exibir os produtos
  function showProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';

    products.forEach((product) => {
      const productElement = document.createElement('div');
      productElement.classList.add('product');
      productElement.innerHTML = `
        <h3>${product.name}</h3>
        <p>R$ ${parseFloat(product.value).toFixed(2)}</p>
        <button class="add-to-cart-button">Adicionar ao Carrinho</button>
      `;
      productsContainer.appendChild(productElement);

      productElement
        .querySelector('.add-to-cart-button')
        .addEventListener('click', () => addToCart(product));
    });
  }

  // Função para carregar produtos
  function loadProducts() {
    fetch('http://localhost:3000/products')
      .then((response) => response.json())
      .then((data) => {
        showProducts(data);
      })
      .catch((error) => {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar os produtos.');
      });
  }

  // Carrinho de compras
  let cart = [];

  // Carregar o carrinho do LocalStorage ao iniciar
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCart();
  }


  function addToCart(product) {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCart();
  }

  function updateCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const finalizePurchaseButton = document.getElementById('finalizePurchaseButton');
    cartItemsContainer.innerHTML = '';
  
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
      finalizePurchaseButton.style.display = 'none';
    } else {
      finalizePurchaseButton.style.display = 'block';
  
      cart.forEach((product) => {
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
          <span>${product.name} - R$ ${parseFloat(product.value).toFixed(2)} x ${product.quantity}</span>
          <button class="remove-button" data-product-id="${product.id}">Remover</button>
        `;
        cartItemsContainer.appendChild(cartItem);
  
        cartItem
          .querySelector('.remove-button')
          .addEventListener('click', () => removeFromCart(product.id));
      });
    }
  
    // **Salvar o carrinho no LocalStorage**
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  

  function removeFromCart(productId) {
    const index = cart.findIndex((item) => item.id === productId);
    if (index !== -1) {
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1);
      }
      updateCart();
    }
  }

  document.getElementById('finalizePurchaseButton').addEventListener('click', function () {
    if (!isLoggedIn) {
      alert('Você precisa estar logado para finalizar a compra.');
    } else if (cart.length === 0) {
      alert('Seu carrinho está vazio.');
    } else {
      alert('Compra finalizada!');
      cart = [];
      localStorage.removeItem('cart'); // Limpa o carrinho do LocalStorage
      updateCart();
    }
  });
  

  // Exibir ou ocultar o carrinho
  document.getElementById('viewCartButton').addEventListener('click', function () {
    if (!isLoggedIn) {
      alert('Você precisa estar logado para acessar o carrinho.');
    } else {
      const cartContainer = document.getElementById('cartContainer');
      cartContainer.classList.toggle('hidden');
    }
  });
});
