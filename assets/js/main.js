const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*',
    'Access-Control-Allow-Origin': '*',
    'credentials': 'include',
    'mode': 'cors',
}

//ToDo Place site name

const siteName = 'http://localhost:8081'

function loaderControl(status) {
    return new Promise((resolve => {
        const loaderWrapper = document.querySelector('.loader-wrapper')
        if (status === 'on') {
            contentPlace.style.opacity = '0'
            setTimeout(() => {
                contentPlace.style.display = 'none'
                pageContainer.classList.add('loading')
                loaderWrapper.style.display = 'flex'
                setTimeout(() => {
                    loaderWrapper.style.opacity = '1'
                    resolve()
                }, 100)
            }, 400)
        }
        if (status === 'off') {
            loaderWrapper.style.opacity = '0'
            setTimeout(() => {
                loaderWrapper.style.display = 'none'
                pageContainer.classList.remove('loading')
                contentPlace.style.display = 'flex'
                setTimeout(() => {
                    contentPlace.style.opacity = '1'
                    resolve()
                }, 100)
            }, 400)
        }
    }))

}

// reusable functions
function authCheck() {
    return sendRequest('GET', `/v1/account/me`, {
        'credentials': 'include',
        headers: {
            'mode': 'cors',
            'accept': '*/*',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .then(function (response) {
            console.log(response)
            if (response.status === 400) {
                window.authStatus = false
            } else {
                window.authStatus = true
            }
        })
}

function getPaymentIndicatorStatus(data) {
    let result = {
        enterButton: '',
        enterButtonVisibility: '',
        enterButtonText: '',
        enterMessage: '',
        buttonStatus: '',
        paymentsLinkStatus: '',
        participation: ''
    }
    switch (data.status) {
        case 'NEW':
            result.enterButton = true
            result.enterButtonVisibility = 'display:block'
            result.enterButtonText = 'Ожидает оплаты'
            result.enterMessage = 'Платеж создан, ожидает вашей оплаты'
            result.buttonStatus = 'waitingForUser'
            result.paymentsLinkStatus = 'active'
            result.participation = false
            break
        case 'CONFIRMED':
            result.enterButton = false
            result.enterButtonVisibility = 'display:none'
            result.enterButtonText = 'Платеж подтвержден'
            result.enterMessage = 'Платеж подтвержден, вы участник складчины'
            result.buttonStatus = 'succeed'
            result.paymentsLinkStatus = 'active'
            result.participation = true
            break
        case 'SEND':
            result.enterButton = false
            result.enterButtonVisibility = 'display:none'
            result.enterButtonText = 'Платеж отправлен'
            result.enterMessage = 'Платеж отправлен, находится на проверке у модератора'
            result.buttonStatus = 'waitingForCheck'
            result.paymentsLinkStatus = ''
            result.participation = false
            break
        default:
            result.enterButton = true
            result.enterButtonVisibility = 'display:block'
            result.enterButtonText = 'Вступить'
            result.enterMessage = 'Нажмите, чтобы создать платеж для вступления'
            result.buttonStatus = ''
            result.paymentsLinkStatus = 'active'
            result.participation = false
    }
    return result
}

function logOut(event) {
    event.preventDefault()
    const logOutRequest = fetch(`${siteName}/logout`, {
        'credentials': 'include',
        headers: {
            'mode': 'cors',
            'accept': '*/*',
            'Access-Control-Allow-Origin': '*'
        }
    }).then(response => {
            if (response.ok) {
                window.authStatus = false
                refreshHeader()
            }
        }
    )
}

function getAccountData(userID) {
    return sendRequest('GET', `/v1/account/${userID}`).then(response => {
        return response
    })
}

function checkCommentsAvailability(commentPlace, clubPageData) {
    if (authStatus) {
        if (clubPageData.thisUser.participation === false) {
            console.log('checkCommentsAvailability - false part status')
            commentPlace.innerHTML =
                `<section class="message"><p>Читать комментарии участников могут только участники группы</p></section>`
            return false
        }
        if (clubPageData.thisUser.participation === true) {
            console.log('checkCommentsAvailability - true part status')
            return true
        }

    } else {
        commentPlace.innerHTML =
            `<section class="message">
           <p>Читать комментарии участников могут только участники группы</p></section>`
        console.log('checkCommentsAvailability - false auth status')
        return false
    }
}

async function showAdminTools(thisPage, parentID) {
    sendRequest('GET', `/v1/account/me`, {
        'credentials': 'include',
        headers: {
            'mode': 'cors',
            'accept': '*/*',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .then(function (data) {
            if (data.role) {
                if (data.role === 'ADMIN') {
                    renderAdminTools(thisPage, parentID)
                }
            }
        })
}

function createSubContentList(element, subContentList, target) {
    const newLiElement = document.createElement('li')
    if (target === 'inner-content') {
        newLiElement.classList.add('catalog-category__sub')
    }
    if (target === 'club-page') {
        newLiElement.classList.add('catalog-category__club')
    }
    const link = document.createElement('a')
    link.dataset.target = target
    link.dataset.crumb = element.name
    link.innerText = element.name
    link.id = element.id
    newLiElement.insertAdjacentElement('afterbegin', link)
    subContentList.insertAdjacentElement("afterbegin", newLiElement)
}

function breadCrumbsControl(id, target, name) {
    function crumbCheck() {
        let result = false
        if (crumbs.length > 0) {
            for (let i = 0; i < crumbs.length; i++) {
                if (crumbs[i].id === id && crumbs[i].dataset.target === target) {
                    result = true
                    break
                }
            }
        }
        return result
    }

    const checkResult = crumbCheck()
    if (!checkResult) {
        const newCrumb = document.createElement('a')
        newCrumb.classList.add('crumb')
        newCrumb.innerText = name
        newCrumb.dataset.crumb = name
        crumbs.push(newCrumb)
        crumbsContainer.insertAdjacentElement('beforeend', newCrumb)
        newCrumb.id = id
        newCrumb.dataset.target = target
        newCrumb.addEventListener('click', () => {
            makeTransition(id, target)
            const thisIndex = crumbs.indexOf(newCrumb)
            for (let i = crumbs.length - 1; i > thisIndex; i = i - 1) {
                crumbs[i].remove()
            }
        })
    }
}

function getBackTarget(crumbs) {
    const lastIndex = crumbs.length - 2
    if (lastIndex > 1) {
        return crumbs[lastIndex]
    } else {
        return crumbs[0]
    }
}

function getBackTargetCreate(crumbs) {
    const lastIndex = crumbs.length - 2 // 2
    if (lastIndex >= 1) {
        return crumbs[lastIndex]
    } else {
        return crumbs[0]
    }
}

function hideAdminTools() {
    const tools = document.getElementById('adminTools')
    tools.classList.add('display-none')
}

function appear(element) {
    element.style.display = 'flex'
    setTimeout(() => {
        element.style.opacity = '1'
    }, 100)
}

function disappear(element) {
    element.style.opacity = '0'
    setTimeout(() => {
        element.style.display = 'none'
    }, 100)
}

function makeScrollTo(element) {
    element.scrollIntoView({behavior: "auto", block: "center"})
    element.classList.add('highlighted')
}

async function createEmptyMessage(contentPlace, id, target, name) {
    const crumbs = document.querySelectorAll('.breadcrumbs a.crumb')
    const backTarget = getBackTargetCreate(crumbs)
    contentPlace.innerHTML = `<div class="empty">
                                <h2>Здесь пусто</h2>
                                <svg xmlns="http://www.w3.org/2000/svg" width="200px" height="200px" viewBox="0 0 200 200" version="1.1">
                                    <g id="surface1">
                                    <path style=" stroke:none;fill-rule:nonzero;fill:#00382B;fill-opacity:1;" d="M 10.890625 69.023438 L 2 113.625 L 2 175.53125 L 198 175.53125 L 198 113.625 L 189.109375 69.023438 L 180.167969 24.46875 L 19.832031 24.46875 Z M 171.230469 33.214844 C 171.230469 33.40625 187.769531 110.46875 188.199219 112.285156 L 188.441406 113.386719 L 125.097656 113.386719 L 123.425781 116.636719 C 119.074219 125.097656 109.417969 131.074219 100 131.074219 C 90.582031 131.074219 80.925781 125.097656 76.574219 116.636719 L 74.902344 113.386719 L 11.464844 113.386719 L 11.753906 112.238281 C 11.894531 111.617188 15.574219 94.550781 19.925781 74.375 C 24.324219 54.15625 28.101562 36.609375 28.339844 35.320312 L 28.867188 33.074219 L 100.046875 33.074219 C 139.199219 33.074219 171.230469 33.167969 171.230469 33.214844 Z M 171.230469 33.214844 "/>
                                    </g>
                                </svg>
                                <a class="bright-button" id="${backTarget.id}" data-target="${backTarget.dataset.target}" data-crumb="${backTarget.dataset.crumb}">Назад</a>
                            </div>`
    contentPlace.querySelector('a.bright-button').addEventListener('click', (event) => {
        const newCrumbs = document.querySelectorAll('.breadcrumbs a.crumb')
        newCrumbs[newCrumbs.length - 1].remove()
        makeTransition(event.target.id, event.target.dataset.target)
    })
}

function sendRequest(method, requestURL, headers, body) {
    const resultURL = siteName + requestURL
    return fetch(resultURL, {
        method: method,
        credentials: 'include',
        headers: headers,
        body: body
    })
        .then(response => {
            return response.json()
        })
        .then(data => {
            return data
        })
}

function findSection(type, id) {
    const allSections = document.querySelectorAll(`section[data-type="${type}"]`);
    return (Array.from(allSections)).find(element => element.id === id)
}

function makeLinks(array) {
    array.forEach(element => {
        if (element.getAttribute('data-dismiss') !== 'true') {
            element.addEventListener('click', (event) => {
                event.preventDefault()
                const id = element.id
                const target = element.dataset.target
                const name = element.dataset.crumb
                breadCrumbsControl(id, target, name)
                makeTransition(id, target)
            })
        }
    })
}

function getThisPayment(array, id) {
    for (let i = 0; i < array.length; i++) {
        if (String(array[i].paymentInfo.clubId) === String(id)) {
            return array[i]
        }
    }
    return undefined
}

// --reusable functions

// modal class
class Modal {
    constructor(options) {
        window.modalContent = options.content
        window.backdrop = document.querySelector('.page-backdrop')
        window.modalWindow = document.querySelector('.page-modal')
        window.closeModal = document.querySelector('#closeModal')
        window.modalContentContainer = document.querySelector('.page-modal__content')
    }

    static show() {
        window.modalContentContainer.innerHTML = window.modalContent
        window.backdrop.style.display = 'flex'
        setTimeout(() => {
            window.backdrop.style.opacity = '1'
            setTimeout(() => {
                window.modalWindow.style.display = 'flex'
                setTimeout(() => {
                    window.modalWindow.style.opacity = '1'
                }, 300)
            }, 10)
        }, 10)
    }

    static hide() {
        window.modalWindow.style.opacity = '0'
        setTimeout(() => {
            window.modalWindow.style.display = 'none'
            setTimeout(() => {
                window.backdrop.style.opacity = '0'
                setTimeout(() => {
                    window.backdrop.style.display = 'none'
                    window.modalContentContainer.innerHTML = ''
                }, 300)
            })
        }, 300)

    }
}

window.addEventListener('DOMContentLoaded', () => {
    authCheck().then(function () {
        console.log('authCheck result:')
        console.log(authStatus)
    })
    window.contentPlace = document.querySelector('.content')
    window.pageContainer = document.querySelector('#page-container')
    window.crumbsContainer = document.querySelector('.breadcrumbs h1')
    window.crumbs = []
})

function makeTransition(id, target, newElement) {
    contentPlace.innerHTML = ''
    switch (target) {
        case 'all-categories' :
            loaderControl('on')
                .then(function () {
                    sendRequest('GET', '/v1/categories', headers)
                        .then(data => {
                            createCategoryList(data)
                                .then(function () {
                                    loaderControl('off')
                                        .then(function () {
                                            showAdminTools('all-categories', '')
                                                .then(function () {
                                                    if (newElement) {
                                                        const newEl = findSection('category', newElement.id)
                                                        if (newEl) {
                                                            makeScrollTo(newEl)
                                                        }
                                                    }
                                                })
                                        })
                                })

                        })
                        .catch(err => console.log(err))
                })
            break
        case 'inner-content' :
            loaderControl('on')
                .then(function () {
                    sendRequest('GET', `/v1/categories?parent_id=${id}`, headers)
                        .then(data => {
                            createSubCategoryList(data)
                                .then(function () {
                                    sendRequest('GET', `/v1/clubs?category_id=${id}&expired=false`, headers)
                                        .then(data => {
                                            createClubList(data)
                                                .then(function () {
                                                    if (contentPlace.innerHTML === '') {
                                                        createEmptyMessage(contentPlace, id, 'inner-content', 'Пустая категория')
                                                            .then(function () {
                                                                showAdminTools('empty-message', `${id}`).then(
                                                                    function () {
                                                                        loaderControl('off')
                                                                            .then(
                                                                                function () {
                                                                                    console.log('empty content')
                                                                                }
                                                                            )
                                                                    }
                                                                )
                                                            })
                                                    } else {
                                                        loaderControl('off')
                                                            .then(function () {
                                                                showAdminTools('inner-content', `${id}`)
                                                                    .then(function () {
                                                                        if (newElement) {
                                                                            const newEl = findSection('category', newElement.id)
                                                                            if (newEl) {
                                                                                makeScrollTo(newEl)
                                                                            }
                                                                        }
                                                                    })
                                                            })

                                                    }
                                                })
                                        })
                                })
                        })
                })
            break
        case 'club-page' :
            loaderControl('on')
                .then(function () {
                    window.processedComments = []
                    window.counter = 0
                    contentPlace.innerHTML = '' +
                        '<div class="theme-content">' +
                        '</div>' +
                        '<h2>Комментарии участников</h2>' +
                        '<div class="comment__section">' +
                        '<div class="comment__list">' +
                        '</div>' +
                        '</div>'
                    sendRequest('GET', `/v1/club/${id}`, headers)
                        .then(data => {
                            renderCLubPage(data)
                                .then(function () {
                                    setTimeout(() => {
                                        const commentPlace = document.querySelector('.comment__list')
                                        const comments = checkCommentsAvailability(commentPlace, clubPageData)
                                        if (comments) {
                                            sendRequest('GET', `/v1/club/${id}/comments`)
                                                .then(function (data) {
                                                    if (data !== []) {
                                                        renderComments(data, commentPlace)
                                                    } else {
                                                        console.log('no comments yet')
                                                    }
                                                })
                                                .then(function () {
                                                    contentPlace.insertAdjacentHTML('beforeend', '<div id="comment-form" class="write">' +
                                                        '<div class="write-reply"></div>' +
                                                            '<div class="write-form">' +
                                                                '<textarea placeholder="Введите ваш комментарий"></textarea>' +
                                                                '<button class="bright-button enabled">Отправить</button>' +
                                                            '</div>' +
                                                        '</div>')
                                                })
                                                .then(function () {
                                                    loaderControl('off')
                                                        .then(function () {
                                                            showAdminTools('club-page', `${id}`)
                                                                .then(function () {
                                                                    console.log('you can see the comments')
                                                                })
                                                        })
                                                })
                                        } else {
                                            loaderControl('off')
                                                .then(function () {
                                                    showAdminTools('club-page', `${id}`)
                                                        .then(function () {
                                                            console.log('you can`t see the comments')
                                                        })
                                                })
                                        }
                                    }, 100)
                                })

                        })
                })

            break
        case 'empty-message':
            loaderControl('on')
                .then(function () {
                    createEmptyMessage()
                        .then(function () {
                            loaderControl('off')
                                .then(function () {
                                    showAdminTools('empty-message', `${id}`)
                                        .then(function () {
                                            console.log('empty content')
                                        })
                                })
                        })
                })

            break
        case 'create-club':
            loaderControl('on')
                .then(function () {
                    createClubForm(id)
                        .then(function () {
                            loaderControl('off')
                                .then(function () {
                                    hideAdminTools()
                                })
                        })
                })

            break
        case 'create-category':
            loaderControl('on')
                .then(function () {
                    createCategoryForm(id)
                        .then(function () {
                            loaderControl('off')
                                .then(function () {
                                    hideAdminTools()
                                })
                        })
                })

            break
        case 'edit-category':
            loaderControl('on')
                .then(function () {
                    sendRequest('GET', `/v1/category/${id}`, headers)
                        .then(data => {
                            editCategory(data)
                                .then(function () {
                                    loaderControl('off')
                                        .then(function () {
                                            hideAdminTools()
                                        })
                                })
                        })
                })

            break
        case 'edit-club':
            loaderControl('on')
                .then(function () {
                    sendRequest('GET', `/v1/club/${id}`, headers)
                        .then(data => {
                            console.log(data)
                            editClub(data)
                                .then(function () {
                                    loaderControl('off')
                                        .then(function () {
                                            hideAdminTools()
                                        })
                                })
                        })
                })

            break
        case 'payments':
            loaderControl('on')
                .then(function () {
                    if (id) {
                        sendRequest('POST', `/v1/payment/${id}`, headers)
                            .then(function () {
                                function checkPayment() {
                                    sendRequest('GET', `/v1/payments?sort=created,desc`, headers)
                                        .then(data => {
                                            const thisPayment = getThisPayment(data.content, id)
                                            console.log(data)
                                            if (thisPayment === undefined) {
                                                console.log('the payment was not found')
                                                checkPayment()
                                            } else {
                                                console.log('the payment was found')
                                                createPaymentsPage(id, data)
                                                    .then(function () {
                                                            loaderControl('off')
                                                                .then(function () {
                                                                    const thisPaymentElement = contentPlace.querySelector(`section[data-club="${id}"]`)
                                                                    console.log(thisPaymentElement)
                                                                    if (thisPaymentElement) {
                                                                        makeScrollTo(thisPaymentElement)
                                                                    }
                                                                    console.log(`opening payments with creating the new payment for club ${id}`)
                                                                })
                                                        }
                                                    )

                                            }
                                        })
                                }
                                checkPayment()
                            })
                    } else {
                        sendRequest('GET', `/v1/payments?sort=created,desc`, headers)
                            .then(data => {
                                    createPaymentsPage(undefined, data)
                                        .then(function () {
                                            loaderControl('off')
                                                .then(function () {
                                                    console.log('opening payments page')
                                                })
                                        })
                                }
                            )
                    }
                })
            break
        case 'auth':
            loaderControl('on')
                .then(function () {
                    authPage()
                    loaderControl('off')
                        .then(function () {
                            console.log('auth page is ready')
                        })
                })
            break
    }
}

if (document.querySelector('.empty-message')) {
    document.querySelector('.empty-message').remove()
}
