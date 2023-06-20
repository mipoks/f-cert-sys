function userRole(data) {
    switch (data) {
        case 'PARTNER':
            return 'Партнёр'
        case 'ADMIN':
            return 'Администратор'
        case 'USER':
            return 'Пользователь'
    }
}

function getParticipantsCount(clubID) {
    return sendRequest('GET', `/v1/club/${clubID}/count`, )
}

function getExpired(clubData) {
    if (clubData.activeInfo.expired === false) {
        return 'Да'
    } else return 'Нет'
}

function checkDiscounts(clubContent) {
    let discounts = {}
    if (clubContent.costInfo.discountCertificateCost !== null) {
        discounts.discountCertificateCost = clubContent.costInfo.discountCertificateCost + ' ₽'
    } else {
        discounts.discountCertificateCost = ''
    }
    if (clubContent.costInfo.discountEntryCost !== null) {
        discounts.discountEntryCost = clubContent.costInfo.discountEntryCost + ' ₽'
    } else {
        discounts.discountEntryCost = ''
    }
    return discounts
}

function checkEnterPossibility(clubID) {
    const resultURL = siteName + `/v1/club/${clubID}/payment`
    return fetch(resultURL, {
        method: 'GET',
        credentials: 'include',
        headers: headers,
    })
        .then(response => {
            return response.json()
        })
}

function getEntryCost(clubPageData) {
    if (!clubPageData.clubInfo.discountEntryCost) {
        return `
            <p>${clubPageData.clubInfo.entryCost} ₽</p>
        `
    } else {
        return `
            <p class="old-price text-light"> ${clubPageData.clubInfo.entryCost} ₽</p>
            <p>${clubPageData.clubInfo.discountEntryCost}</p>
        `
    }
}

function getCertificateCost(clubPageData) {
    if (!clubPageData.clubInfo.discountCertificateCost) {
        return `
            <p>${clubPageData.clubInfo.certificateCost} ₽</p>
        `
    } else {
        return `
            <p class="old-price text-light"> ${clubPageData.clubInfo.certificateCost} ₽</p>
            <p>${clubPageData.clubInfo.discountCertificateCost}</p>
        `
    }
}

function insertClubLayout(clubPageData, clubContentPlace) {
    const clubBody = `<div class="theme-content__top">
                         <section class="project-theme">
                                            <div class="user">
                                                <div class="user__avatar">
                                                    <p>${clubPageData.author.avatar}</p>
                                                </div>
                                                <h3 class="user__nickname">${clubPageData.author.nick}</h3>
                                                <p class="aside-text">${clubPageData.author.role}</p>
                                            </div>
                                            <div class="project-theme__body">
                                                <div>
                                                    <div class="project-theme__body--header">
                                                        <div>
                                                            <h2>${clubPageData.clubContent.header}</h2>
                                                        </div>
                                                    </div>
                                                    <div class="project-theme__body--text">
                                                        <p>${clubPageData.clubContent.description}</p>
                                                    </div>
                                                </div>
                    
                                                <div class="aside-text">
                                                    ${clubPageData.clubContent.created}
                                                </div>
                                                <div class="project-images" style="display: none;">
                                                    <button class="button-dark">
                                                        Показать изображения
                                                    </button>
                                                    <div class="project-images__container">
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                         <section class="sidebar">
                                        <div class="project-info">
                                            <div class="project-info__header">
                                                <h5>Информация о складчине</h5>
                                                <p class="text-light">Активна:</p>
                                                <p class="aside-text">${clubPageData.clubInfo.notExpired}</p>
                                                <p class="text-light">Когда закроется:</p>
                                                <p class="aside-text">${clubPageData.clubInfo.expireCondition}</p>
                                            </div>
                                            <div class="project-info__body">
                                                <div class="project-info__item">
                                                    <p>Вход</p>
                                                    <div>
                                                        ${getEntryCost(clubPageData)}
                                                    </div>
                                                </div>
                                                <div class="project-info__item">
                                                    <p>Целевая сумма</p>
                                                    <div>
                                                        ${getCertificateCost(clubPageData)}
                                                    </div>
                                                </div>
                                                <div class="project-info__item">
                                                    <p>Создано</p>
                                                    <p>${clubPageData.clubContent.created}</p>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        <!--     enter club button      -->
                                        <div class="project-info">
                                            <button id="paymentsLink" 
                                            class="status-button not-active ${clubPageData.thisUser.paymentsLinkStatus} ${clubPageData.thisUser.buttonStatus}" 
                                            data-club-id="${clubPageData.clubInfo.clubID}" 
                                            style="margin-bottom: 15px">
                                                ${clubPageData.thisUser.enterButtonText} 
                                            </button>
                                            <p class="project-message" >${clubPageData.thisUser.enterMessage}</p>
                                        </div>
                                        <!--     / enter club button      -->
                                      
                         </section>
                      </div>`
    clubContentPlace.insertAdjacentHTML('afterbegin', clubBody)
}

////////////////////////////////////

function renderCLubPage(response) {
    window.clubPageData = {
        author: {},
        clubContent: {},
        clubInfo: {},
        thisUser: {}
    }
    const clubData = response
    console.log('response: ')
    console.log(clubData)
    const clubContentPlace = document.querySelector('.theme-content')
    return getAccountData(clubData.authorId)
        // getting author info
        .then(getAuthorDataResponse => {
            clubPageData.author.avatar = (getAuthorDataResponse.email.slice(0, 1)).toUpperCase()
            clubPageData.author.nick = getAuthorDataResponse.email
            clubPageData.author.role = userRole(getAuthorDataResponse.role)
            // getting club content
            clubPageData.clubContent.header = clubData.name
            clubPageData.clubContent.description = clubData.description
            clubPageData.clubContent.created = clubData.created
            clubPageData.clubContent.clubID = clubData.id
        })
        // getting club info
        .then(function() {
            getParticipantsCount(clubData.id)
                .then(data => {
                    clubPageData.clubInfo.clubID = clubData.id
                    clubPageData.clubInfo.participants = data
                    clubPageData.clubInfo.expireCondition = clubData.activeInfo.expireCondition
                    clubPageData.clubInfo.notExpired = getExpired(clubData)
                    clubPageData.clubInfo.certificateCost = clubData.costInfo.certificateCost
                    clubPageData.clubInfo.entryCost = clubData.costInfo.entryCost
                    const discounts = checkDiscounts(clubData)
                    clubPageData.clubInfo.discountCertificateCost = discounts.discountCertificateCost
                    clubPageData.clubInfo.discountEntryCost = discounts.discountEntryCost
                })
                .then(function() {
                    authCheck()
                        .then(function() {
                            if (authStatus) {
                                checkEnterPossibility(clubData.id)
                                    .then(function(data) {
                                        if (data.hasOwnProperty('paymentInfo')) {
                                            const paymentIndicator = getPaymentIndicatorStatus(data)
                                            clubPageData.thisUser.enterButton = paymentIndicator.enterButton
                                            clubPageData.thisUser.enterButtonVisibility = paymentIndicator.enterButtonVisibility
                                            clubPageData.thisUser.enterButtonText = paymentIndicator.enterButtonText
                                            clubPageData.thisUser.enterMessage = paymentIndicator.enterMessage
                                            clubPageData.thisUser.buttonStatus = paymentIndicator.buttonStatus
                                            clubPageData.thisUser.paymentsLinkStatus = paymentIndicator.paymentsLinkStatus
                                            clubPageData.thisUser.paymentsLinkStatus = paymentIndicator.paymentsLinkStatus
                                            clubPageData.thisUser.participation = true
                                        }
                                    })
                                    .catch(function (err) {
                                        clubPageData.thisUser.enterButton = true
                                        clubPageData.thisUser.enterButtonVisibility = 'display:block'
                                        clubPageData.thisUser.enterButtonText = 'Вступить'
                                        clubPageData.thisUser.enterMessage = 'Нажмите, чтобы вступить'
                                        clubPageData.thisUser.buttonStatus = 'active'
                                        clubPageData.thisUser.participation = false
                                    })
                                    .then(function () {
                                        insertClubLayout(clubPageData, clubContentPlace)
                                        const paymentsLinks = contentPlace.querySelectorAll('#paymentsLink')
                                        paymentsLinks.forEach(element => {
                                            element.addEventListener('click', () => {
                                                makeTransition(clubPageData.clubInfo.clubID, 'payments')
                                            })
                                        })
                                        return clubPageData
                                    })
                            } else {
                                console.log('auth status: false')
                                clubPageData.thisUser.enterButton = false
                                clubPageData.thisUser.enterButtonVisibility = 'display:none'
                                clubPageData.thisUser.enterButtonText = ''
                                clubPageData.thisUser.enterMessage = 'Войдите в профиль или зарегистрируйтесь чтобы вступить'
                                clubPageData.thisUser.buttonStatus = 'display-none'
                                clubPageData.thisUser.enterButton = false
                                clubPageData.thisUser.enterButtonVisibility = 'display:none'
                                clubPageData.thisUser.participation = false
                                clubPageData.thisUser.participationVisibility = 'display:none'
                                clubPageData.thisUser.paymentsLinkStatus = ''
                                insertClubLayout(clubPageData, clubContentPlace)
                                return clubPageData
                            }
                        }
                    )
                }
            )
        })

}