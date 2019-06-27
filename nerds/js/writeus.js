  	var link = document.querySelector(".btn-address");
		var writeus = document.querySelector(".writeus");
		var close = writeus.querySelector(".writeus-close");
		var form = writeus.querySelector("form");
		var login = writeus.querySelector("[name=login]");
		var mail = writeus.querySelector("[name=email]");
		var text = writeus.querySelector("[name=textarea]");
		var storage = localStorage.getItem("login");

		link.addEventListener("click", function (evt) {
			evt.preventDefault();
			writeus.classList.add("modal-show");
			login.focus();
		});

		close.addEventListener("click", function (evt) {
			evt.preventDefault();
			writeus.classList.remove("modal-show");
			writeus.classList.remove("modal-error");
		});

		window.addEventListener("keydown", function(evt) {
			if (evt.keyCode == 27) {
				if (writeus.classList.contains("modal-show")) {
					writeus.classList.remove("modal-show");
					writeus.classList.remove("modal-error");
				}
			}
		});

		form.addEventListener("submit", function (evt) {
			if (!login.value || !mail.value || !text.value) {
				evt.preventDefault();
				writeus.classList.add("modal-error");
			} else {
				localStorage.setItem("login", login.value);
			}
		});