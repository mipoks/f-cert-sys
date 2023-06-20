function auth(event) {
    event.preventDefault()
    const form = document.querySelector('#loginForm')
    const data = new FormData()
    const userName = form.querySelector('#loginName').value
    const password = form.querySelector('#loginPassword').value
    const message = document.querySelector('.auth-message')
    data.append('username', userName)
    data.append('password', password)

    const loginRequest = fetch(`${siteName}/login?`, {
        'method': 'POST',
        'body': data,
        'credentials': 'include',
        'mode': 'cors',
        headers: {
            'accept': '*/*',
            'Access-Control-Allow-Origin': '*'
        }
    }).then(response => {
        if (response.ok) {
            message.querySelector('p').innerText = 'Успешная авторизация'
            setTimeout(() => {
                makeTransition('unset', 'all-categories')
                breadCrumbsControl('unset', 'all-categories', 'Все категории')
            }, 2000)
            message.style.opacity = '1'
            window.authStatus = true
            refreshHeader()
        }
        if (response.status === 401) {
            message.querySelector('p').innerText = 'Неверные данные для входа'
            setTimeout(() => {
                message.style.opacity = '0'
            }, 3000)
            message.setAttribute('style', 'opacity: 1; color: red;')
            window.authStatus = false
            refreshHeader()
        }
    }).catch(err => console.log(err)
    )
}

function authPage() {
    contentPlace.innerHTML = `
            <main class="main-auth">
            <section class="container-auth">
                <div class="container-auth__logo">
                    <img src="../assets/img/authlogo.svg" alt="">
                </div>
                <form id="loginForm">
                    <input id="loginName" type="text" placeholder="Введите почту">
                    <input id="loginPassword" type="password" placeholder="Введите пароль">
                    <a href="#">Забыли пароль?</a>
                    <button type="submit" class="bright-button" style="margin-top: 32px" id="loginButton">Вход</button>
                </form>
<!--                <a class="crumb" data-crumb="Все категории" id="unset" data-target="all-categories"><p>Без логина</p></a>-->
            </section>
            <div class="auth-message">
                <p></p>
            </div>
        </main>
    `
    const loginButton = document.querySelector('#loginButton')
    if (loginButton) {
        loginButton.addEventListener('click', auth)
    }
}
