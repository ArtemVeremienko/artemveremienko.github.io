'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = logInForm.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const logo = document.querySelector('.logo');
const menu = document.querySelector('.menu');
const cardsMenu = menu.querySelector('.cards-menu');
const cardsHeading = menu.querySelector('.section-heading');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('delivery');
const cart = []; // список товаров в корзине

// загружаю списко товаров с localStorage
const loadCart = () => {
  const value = JSON.parse(localStorage.getItem(login));
  if (value) cart.push(...value);
};

// сохраняю список товаров в localStorage
const saveCart = () => localStorage.setItem(login, JSON.stringify(cart));

const clearCart = () => {
  cart.length = 0;
  localStorage.removeItem(login);
}

const getData = async function (url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, 
    статус ошибки ${response.status}!`);
  }

  return await response.json();
};

const valid = function (str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str)
}

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth() {
  modalAuth.classList.toggle('is-open');
}

// показывает список ресторанов и скрывает меню с карточками товаров
function returnMain() {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
}

// показывает меню с карточками товаров и скрывает с ресторанами
function showMenu() {
  containerPromo.classList.add('hide');
  restaurants.classList.add('hide');
  menu.classList.remove('hide');
}

function autorized() {

  function logOut() {
    login = localStorage.removeItem('delivery');
    cart.length = 0;

    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }

  userName.textContent = login;

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
  loadCart();
}

function notAutorized() {

  function logIn(event) {
    event.preventDefault();

    if (!valid(loginInput.value)) {
      alert('Введите правильный логин!');
      return;
    };

    login = loginInput.value;

    localStorage.setItem('delivery', login);

    toggleModalAuth();
    buttonAuth.removeEventListener('click', toggleModalAuth);
    closeAuth.removeEventListener('click', toggleModalAuth);
    logInForm.removeEventListener('submit', logIn);
    logInForm.reset();
    checkAuth();
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

const checkAuth = () => login ? autorized() : notAutorized();

function createCardRestaurnats(restaurant) {

  const {
    image,
    kitchen,
    name,
    price,
    products,
    stars,
    time_of_delivery: timeOfDelivery
  } = restaurant;


  const card = `
          <a class="card card-restaurant" data-products="${products}" data-info="${[name, stars, price, kitchen]}">
            <img src="${image}" alt="${name}" class="card-image" />
            <div class="card-text">
              <div class="card-heading">
                <h3 class="card-title">${name}</h3>
                <span class="card-tag tag">${timeOfDelivery} мин</span>
              </div>
              <div class="card-info">
                <div class="rating">
                  ${stars}
                </div>
                <div class="price">От ${price} ₽</div>
                <div class="category">${kitchen}</div>
              </div>
            </div>
          </a>`;
  cardsRestaurants.insertAdjacentHTML('afterbegin', card);
}

function createCardGood({
  description,
  id,
  image,
  name,
  price
}) {
  const card = document.createElement('div');
  card.className = 'card';
  card.id = id;
  card.insertAdjacentHTML('beforeend', `
      <img src="${image}" alt="${name}" class="card-image" />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title card-title-reg">${name}</h3>
        </div>
        <!-- /.card-heading -->
        <div class="card-info">
          <div class="ingredients">${description}
          </div>
        </div>
        <!-- /.card-info -->
        <div class="card-buttons">
          <button class="button button-primary button-add-cart">
            <span class="button-card-text">В корзину</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price card-price-bold">${price} ₽</strong>
        </div>
      </div>
  `);

  cardsMenu.append(card);
}

// создаёт хедер для карточек с информацией магазина с которго зашли
function createCardsHeading([name, stars, price, kitchen]) {

  cardsHeading.insertAdjacentHTML('afterbegin',
    `<h2 class="section-title restaurant-title">${name}</h2>
    <div class="card-info">
      <div class="rating">
        ${stars}
      </div>
      <div class="price">От ${price} ₽</div>
      <div class="category">${kitchen}</div>
    </div>`);

}

// создаёт хедер для результат поиска
function createSearchHeading(title) {
  cardsHeading.insertAdjacentHTML('afterbegin',
    `<h2 class="section-title restaurant-title">${title}</h2>`);
}

function openGoods(event) {

  if (!login) {
    toggleModalAuth();
    return;
  }

  const target = event.target;
  const restaurant = target.closest('.card-restaurant');

  if (!restaurant) return;

  cardsHeading.textContent = '';
  cardsMenu.textContent = '';
  showMenu();

  createCardsHeading(restaurant.dataset.info.split(','));

  getData(`./db/${restaurant.dataset.products}`).then(data => data.forEach(createCardGood));
}

function addToCart(event) {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');

  if (!buttonAddToCart) return;

  const card = buttonAddToCart.closest('.card');
  const title = card.querySelector('.card-title-reg').textContent;
  const cost = card.querySelector('.card-price').textContent;
  const id = card.id;
  const food = cart.find(item => item.id === id);

  if (food) {
    food.count++;
  } else {
    cart.push({ id, title, cost, count: 1 });
  }

  saveCart();
}

function renderCart() {
  modalBody.textContent = '';

  cart.forEach(({ id, title, cost, count }) => {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id="${id}">-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id="${id}">+</button>
        </div>
      </div>
    `;

    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  });

  const totalPrice = cart.reduce((result, item) => result + (parseFloat(item.cost) * item.count), 0);

  modalPrice.textContent = `${totalPrice} ₽`;
}

// обновляем данные при изменении колчества товаров в корзине
function changeCount(event) {
  const target = event.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(item => item.id === target.dataset.id);

    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count == 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }

    if (target.classList.contains('counter-plus')) {
      food.count++;
    }

    renderCart();
    saveCart();
  }

}

function init() {
  getData('./db/partners.json').then(data => data.forEach(createCardRestaurnats));

  cartButton.addEventListener("click", renderCart);
  cartButton.addEventListener("click", toggleModal);

  modalBody.addEventListener('click', changeCount);

  cardsMenu.addEventListener('click', addToCart);

  buttonClearCart.addEventListener('click', () => {
    cart.length = 0;
    saveCart();
    renderCart();
  })

  close.addEventListener("click", toggleModal);

  cardsRestaurants.addEventListener('click', openGoods);

  logo.addEventListener('click', returnMain);

  // поиск по всем товарам
  inputSearch.addEventListener('keydown', event => {
    if (event.code == 'Enter') {
      const target = event.target;
      const value = target.value.toLowerCase().trim();

      if (!value || value.length < 3) {
        target.style.backgroundColor = 'tomato';
        setTimeout(() => target.style.backgroundColor = '', 2000);
        return;
      }

      target.value = '';

      const goods = [];

      getData('./db/partners.json')
        .then(data => {
          const products = data.map(item => item.products)

          products.forEach(product => {
            getData(`./db/${product}`)
              .then(data => {
                goods.push(...data);
                const searchGoods = goods.filter(item => item.name.toLowerCase().includes(value));
                cardsHeading.textContent = '';
                cardsMenu.textContent = '';
                showMenu();

                createSearchHeading('Результат поиска');

                return searchGoods;
              })
              .then(data => {
                if (data.length) {
                  data.forEach(createCardGood);
                } else {
                  cardsMenu.insertAdjacentHTML('beforeend', `<p>По запросу <b>'${value}'</b> ничего не найдено ☹</p>`);
                }

              });
          })
        })

    }

  })

  checkAuth()

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
      delay: 3000
    }
  });
}

init();