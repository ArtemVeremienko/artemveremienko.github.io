'use strict';

const MAX_FILESIZE = 500 * 1024; // 1 Kb = 1024 Bytes

const dataBase = JSON.parse(localStorage.getItem('awito')) || [];

const modalAdd = document.querySelector('.modal__add'),
  addAd = document.querySelector('.add__ad'),
  modalBtnSubmit = document.querySelector('.modal__btn-submit'),
  modalSubmit = document.querySelector('.modal__submit'),
  catalog = document.querySelector('.catalog'),
  modalItem = document.querySelector('.modal__item'),
  modalBtnWarning = document.querySelector('.modal__btn-warning'),
  modalFileInput = document.querySelector('.modal__file-input'),
  modalFileBtn = document.querySelector('.modal__file-btn'),
  modalImageAdd = document.querySelector('.modal__image-add'),
  searchInput = document.querySelector('.search__input'),
  menuContainer = document.querySelector('.menu__container');

let counter = dataBase.length || 0; // for card item id
const defaultBtnText = modalFileBtn.textContent;
const defaultImageSrc = modalImageAdd.src;
const infoPhoto = {};

const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase));

const closeModal = event => {
  const target = event.target;

  if (target.closest('.modal__close') ||
    target.classList.contains('modal') ||
    event.code === 'Escape') {
    modalAdd.classList.add('hide');
    modalItem.classList.add('hide');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', closeModal);
    if (target.closest('.modal__add')) {
      modalSubmit.reset();
      modalImageAdd.src = defaultImageSrc;
      modalFileBtn.textContent = defaultBtnText;
      checkForm();
    };
  }
};

const checkForm = event => {
  const isValidForm = [...modalSubmit.elements].filter(elem => elem.type !== 'submit').every(elem => elem.value);

  modalBtnSubmit.disabled = !isValidForm;

  isValidForm ? modalBtnWarning.style.display = 'none' : modalBtnWarning.style.display = '';
};

const renderCard = (DB = dataBase) => {
  catalog.textContent = '';

  DB.forEach((item) => {
    const { image, nameItem, costItem, id } = item;
    catalog.insertAdjacentHTML('beforeend', `
      <li class="card" data-id="${id}">
        <img class="card__image" src="data:image/png;base64,${image}" alt="${nameItem}">
        <div class="card__description">
          <h3 class="card__header">${nameItem}</h3>
          <div class="card__price">${costItem} ₽</div>
        </div>
      </li>`);
  })
};

const renderModalItem = index => {
  modalItem.textContent = '';

  const { image, nameItem, descriptionItem, status, costItem } = dataBase[index];

  modalItem.insertAdjacentHTML('beforeend', `
    <div class="modal__block">
			<h2 class="modal__header">Купить</h2>
			<div class="modal__content">
				<div><img class="modal__image modal__image-item" src="data:image/png;base64,${image}" alt="${nameItem}"></div>
				<div class="modal__description">
					<h3 class="modal__header-item">${nameItem}</h3>
					<p>Состояние: <span class="modal__status-item">${status === 'old' ? 'Б/у' : 'Новый'}</span></p>
					<p>Описание:
						<span class="modal__description-item">${descriptionItem}</span>
					</p>
					<p>Цена: <span class="modal__cost-item">${costItem} ₽</span></p>
					<button class="btn">Купить</button>
				</div>
			</div>
			<button class="modal__close">&#10008;</button>
		</div>
  `)
};

// Modal handlers

addAd.addEventListener('click', () => {
  modalAdd.classList.remove('hide');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', closeModal);
});

modalAdd.addEventListener('click', closeModal);

catalog.addEventListener('click', event => {
  const target = event.target.closest('.card');

  if (!target) return;

  renderModalItem(target.dataset.id);
  modalItem.classList.remove('hide');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', closeModal);
});

modalItem.addEventListener('click', closeModal);

// Form handlers

modalSubmit.addEventListener('input', checkForm);

modalSubmit.addEventListener('submit', event => {
  event.preventDefault();
  const modalSubmitData = new FormData(modalSubmit);
  modalSubmitData.set('image', infoPhoto.base64);
  modalSubmitData.set('id', counter++);
  dataBase.push(Object.fromEntries(modalSubmitData));
  closeModal({ target: modalAdd });
  saveDB();
  renderCard();
});

modalFileInput.addEventListener('change', event => {
  const target = event.target;
  const reader = new FileReader();
  const file = target.files[0];

  infoPhoto.filename = file.name;
  infoPhoto.size = file.size;

  reader.readAsBinaryString(file);

  reader.addEventListener('load', event => {
    if (infoPhoto.size < MAX_FILESIZE) {
      modalFileBtn.textContent = infoPhoto.filename;
      infoPhoto.base64 = btoa(event.target.result);
      modalImageAdd.src = `data:image/png;base64,${infoPhoto.base64}`;
    } else {
      modalFileBtn.textContent = `Файл не должен превышать ${MAX_FILESIZE / 1024}Кб`;
      modalFileInput.value = '';
      checkForm();
    }

  });
});

searchInput.addEventListener('input', () => {
  const valueSearch = searchInput.value.trim().toLowerCase();

  if (valueSearch.length > 2) {
    const result = dataBase.filter(item => item.nameItem.toLowerCase().includes(valueSearch) || item.descriptionItem.toLowerCase().includes(valueSearch));
    renderCard(result);
  } else {
    renderCard();
  }
});

menuContainer.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target.closest('a');

  if (!target) return;
  const result = dataBase.filter(item => item.category === target.dataset.category);
  renderCard(result);
});

renderCard();