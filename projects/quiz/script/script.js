'use strict';

// Обработчик который отслеживает загрузку контента HTML
document.addEventListener('DOMContentLoaded', () => {
  const btnOpenModal = document.querySelector('#btnOpenModal'),
    modalWrap = document.querySelector('.modal'),
    modalBlock = document.querySelector('#modalBlock'),
    closeModal = document.querySelector('#closeModal'),
    questionTitle = document.querySelector('#question'),
    formAnswers = document.querySelector('#formAnswers'),
    burgerBtn = document.getElementById('burger'),
    nextButton = document.getElementById('next'),
    prevButton = document.getElementById('prev'),
    sendButton = document.getElementById('send'),
    modalDialog = document.querySelector('.modal-dialog'),
    modalTitle = document.querySelector('.modal-title');

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBSR9TRUwB9q7aZZpUv-F7A_E4mP3mKspo",
    authDomain: "burger-quiz-22ce8.firebaseapp.com",
    databaseURL: "https://burger-quiz-22ce8.firebaseio.com",
    projectId: "burger-quiz-22ce8",
    storageBucket: "burger-quiz-22ce8.appspot.com",
    messagingSenderId: "657537253325",
    appId: "1:657537253325:web:848c8e9ff7e92ba756ce84",
    measurementId: "G-C1J3LS26HV"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const getData = () => {
    formAnswers.innerHTML = loader;
    // вызов файла json с сайта firebase
    firebase.database().ref().child('questions').once('value')
      .then(snap => playTest(snap.val()));
  };

  // скинер лоадера с стороннего сайта
  let loader = `
    <style type="text/css">#hellopreloader>p{display:none;}#hellopreloader_preload{display: block;position: fixed;z-index: 99999;top: 0;left: 0;width: 100%;height: 100%;min-width: 1000px;background: #E4F1FE url(http://hello-site.ru//main/images/preloads/puff.svg) center center no-repeat;background-size:100px;}</style>
    <div id="hellopreloader_preload"></div><p><a href="http://hello-site.ru">Hello-Site.ru. Бесплатный конструктор сайтов.</a></p>
  `;

  // анимация модалки
  let count = -100;
  modalDialog.style.top = count + '%';

  const animateModal = () => {
    modalDialog.style.top = count + '%';
    count += 3;

    if (count < 0) {
      requestAnimationFrame(animateModal);
    } else {
      count = -100;
    }
  };

  // адаптивность через значение clientWidth
  let clientWidth = document.documentElement.clientWidth;

  const showBurger = () => {
    if (clientWidth < 768) {
      burgerBtn.style.display = 'flex';
    } else {
      burgerBtn.style.display = 'none';
    }
  }

  showBurger();

  window.addEventListener('resize', () => {
    clientWidth = document.documentElement.clientWidth;

    showBurger();
  });

  const showModal = () => {
    requestAnimationFrame(animateModal); // вызов анимации моадлки
    prevButton.classList.remove('d-none');
    nextButton.classList.remove('d-none');
    modalBlock.classList.add('d-block');
    getData();
  };

  // кнопка бургер меню
  burgerBtn.addEventListener('click', showModal);

  // обработчики события открытий/закрытий модального окна
  btnOpenModal.addEventListener('click', showModal);

  closeModal.addEventListener('click', () => {
    modalBlock.classList.remove('d-block');
    burgerBtn.classList.remove('active');
  });

  // клик на пустом месте закрывает форму
  modalWrap.addEventListener('click', (e) => {
    if (!e.target.querySelector('.modal-dialog')) return;
    modalBlock.classList.remove('d-block');
    burgerBtn.classList.remove('active');
  });

  const playTest = (questions) => {

    const finalAnswers = [];
    const obj = {};

    let numberQuestion = 0;
    modalTitle.textContent = 'Ответь на вопрос';

    // рендеринг ответов и динамический вывод на страницу
    const renderAnswers = (index) => {
      // карточка вопроса, проходим циклом по массиву и выводим в верстку
      questions[index].answers.forEach(answer => {
        const answerItem = document.createElement('div');
        answerItem.classList.add('answers-item', 'd-flex', 'justify-content-center');
        answerItem.innerHTML = `
          <input type="${questions[index].type}" id="${answer.title}" name="answer" class="sr-only" value="${answer.title}">
          <label for="${answer.title}" class="d-flex flex-column justify-content-between">
            <img class="answerImg" src="${answer.url}" alt="burger">
            <span>${answer.title}</span>
          </label>
        `;
        formAnswers.appendChild(answerItem);
      })
    };

    // собирает карточку вопроса
    const renderQuestions = (indexQuestion) => {
      formAnswers.innerHTML = '';
      // проверяем на количество и делаем кнопки next/prev неактивными
      switch (true) {
        case (numberQuestion === 0):
          renderAnswers(indexQuestion);
          prevButton.disabled = 'true';
          break;

        case (numberQuestion >= 0 && numberQuestion <= questions.length - 1):
          renderAnswers(indexQuestion);
          questionTitle.textContent = `${questions[indexQuestion].question}`;
          prevButton.disabled = '';
          nextButton.disabled = '';
          sendButton.classList.add('d-none');
          break;

        case (numberQuestion === questions.length):
          prevButton.classList.add('d-none');
          nextButton.classList.add('d-none');
          sendButton.classList.remove('d-none');
          modalTitle.textContent = '';
          questionTitle.textContent = '';
          formAnswers.innerHTML = `
            <div class="form-group">
              <label for = "numberPhone"> Enter your number </label>
              <input type="phone" class="form-control" id="numberPhone" placeholder="Phone number">
					  </div>	
          `;
          // запрет на ввод в строку телефона других символов кроме цифр и +-
          const numberPhone = document.getElementById('numberPhone');
          numberPhone.addEventListener('input', e => {
            e.target.value = e.target.value.replace(/[^0-9+-]/, ''); // регулярное выражение
          });
          break;

        case (numberQuestion === questions.length + 1): // страница благодарности
          formAnswers.textContent = 'Спасибо за пройденный тест!';
          prevButton.classList.add('d-none');
          nextButton.classList.add('d-none');
          for (let key in obj) {
            let newObj = {};
            newObj[key] = obj[key];
            finalAnswers.push(newObj);
          }
          setTimeout(() => {
            modalBlock.classList.remove('d-block');
            burgerBtn.classList.remove('active');
            prevButton.disabled = '';
            nextButton.disabled = '';
          }, 2000);
          sendButton.classList.add('d-none');
          break;
      }
    };

    // запуск рендеринга
    renderQuestions(numberQuestion);

    const checkAnswer = () => {
      const inputs = [...formAnswers.elements].filter(input => input.checked || input.id === 'numberPhone');

      inputs.forEach((input, index) => {
        if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
          obj[index + "_" + questions[numberQuestion].question] = input.value;
        }
        if (numberQuestion === questions.length) {
          obj['Номер телефона'] = input.value;
        }
      });
    };

    // обработчики событий кнопок next и prev
    nextButton.onclick = () => {
      checkAnswer();
      numberQuestion++;
      renderQuestions(numberQuestion);
    };

    prevButton.onclick = () => {
      numberQuestion--;
      renderQuestions(numberQuestion);
    };

    sendButton.onclick = () => {
      checkAnswer();
      numberQuestion++;
      renderQuestions(numberQuestion);
      // по клику на кнопку обращаемся к firebase серверу для получения json данных
      firebase
        .database()
        .ref()
        .child('contacts')
        .push(finalAnswers);
    };
  };
});

