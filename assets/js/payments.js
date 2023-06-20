function getCommentsStatus(element) {
    let status = {}
    if (element.comment !== null) {
        status.userComment = 'display: block'
        status.userCommentText = element.comment
    } else {
        status.userComment = 'display: none'
        status.userCommentText = ''
    }
    if (element.paymentInfo.comment !== null) {
        status.moderatorComment = 'display: block'
        status.moderatorCommentText = element.paymentInfo.comment
    } else {
        status.moderatorComment = 'display: none'
        status.moderatorCommentText = ''
    }
    return status
}

function userSentPayment(paymentId) {
    sendRequest('POST', `/v1/payment/${paymentId}/send`, headers)
        .then(data => {
            if (data.hasOwnProperty('paymentInfo')) {
                const thisButton = document.querySelector(`button[data-payment-id="${paymentId}"]`)
                thisButton.remove()
                const thisSection = document.querySelector(`section.payment[id="${paymentId}"]`)
                const indicator = thisSection.querySelector('.status-button')
                const indicatorMessage = thisSection.querySelector('.status p.aside-text')
                indicator.setAttribute('class', '')
                indicator.classList.add('status-button', 'waitingForCheck')
                indicator.innerText = 'Платеж отправлен'
                indicatorMessage.innerText = 'Платеж отправлен, находится на проверке у модератора'
            }
            Modal.hide()
        })
}

function paymentButton(visibility, id) {
    if (visibility === 'display:block') {
        return `<button class="user__button" id="paymentAction" data-payment-id="${id}">Я оплатил</button>`
    } else {
        return ''
    }
}

function createPaymentItem(element, name) {
    return new Promise((resolve) => {
        const paymentIndicator = getPaymentIndicatorStatus(element)
        const commentStatus = getCommentsStatus(element)
        const itemLayout = `
          <section class="payment" id="${element.id}" data-club="${element.paymentInfo.clubId}">
            <div class="payment__left">
                  <div>
                       <p class="payment__header">Складчина:</p>
                       <h2><a data-target="club-page" id="${element.paymentInfo.clubId}" data-crumb="${name}">${name}</a></h2>
                  </div>
                  <div class="payment__actions">
                    <button class="user__button" style="margin-right: 20px" id="requisite" data-club="${element.paymentInfo.clubId}">Посмотреть реквизиты</button>
                    ${paymentButton(paymentIndicator.enterButtonVisibility, element.id)}
                  </div>
                  
                  <div class="payment__comment" style="${commentStatus.userComment}">
                      <p>Комментарий пользователя к платежу:</p>
                      <div class="payment__comment--field">
                        ${commentStatus.userCommentText}
                      </div>
                  </div>
            </div>
            
            <div class="status">
              <p class="payment__header">Статус платежа:</p>
              <div class="status-button ${paymentIndicator.buttonStatus}">${paymentIndicator.enterButtonText}</div>
              <p class="aside-text">${paymentIndicator.enterMessage}</p>
              
              <div class="payment__comment" style="${commentStatus.moderatorComment}">
                  <p>Комментарий модератора к платежу:</p>
                  <div class="payment__comment--field">
                    ${commentStatus.moderatorCommentText}
                  </div>
              </div>
            </div>
          </section>
        `
        contentPlace.insertAdjacentHTML('beforeend', itemLayout)
        const thisElement = document.querySelector(`section.payment[id="${element.id}"]`)
        const requisiteButton = thisElement.querySelector(`#requisite[data-club="${element.paymentInfo.clubId}"]`)
        requisiteButton.addEventListener('click', () => {
            const requisiteModal = new Modal({
                content: `
                <div class="requisite-info">
                    <h2 style="margin-bottom: 20px">Реквизиты для оплаты вступления</h2>
                    <div class="requisite-info__item">
                        <span>Название клуба:</span>
                        <p class="requisite-info__value">${name}</p>
                    </div>
                    <div class="requisite-info__item">
                        <span>Имя владельца карты:</span>
                        <p class="requisite-info__value">${element.requisiteDTO.requisiteInfo.cardHolder}</p>
                    </div>
                    <div class="requisite-info__item">
                        <span>Номер карты:</span>
                        <p class="requisite-info__value">${element.requisiteDTO.requisiteInfo.cardNumber}</p>
                    </div>
                </div>
                `,
            })
            Modal.show()
        })
        const paymentAction = thisElement.querySelector('#paymentAction')
        if (paymentAction) {
            paymentAction.addEventListener('click', () => {
                const requisiteModal = new Modal({
                    content: `
                        <p style="max-width: 300px; text-align: center">Нажмите "Да" чтобы подтвердить что вы совершили платеж. Нажмите "Нет", чтобы закрыть окно</p>
                        <div class="payment__modal-actions-container">
                            <div
                            class="user__button"
                            id="paymentUserConfirm" 
                            data-payment-id="${paymentAction.dataset.paymentId}">
                            Да 
                            </div>
                            <div class="user__button" id="modalCancel">Нет</div>
                        </div>
                `,
                })
                Modal.show()
                const yes = document.querySelector('#paymentUserConfirm')
                yes.addEventListener('click', () => {
                    userSentPayment(paymentAction.dataset.paymentId)
                })
                const no = document.querySelector('#modalCancel')
                no.addEventListener('click', Modal.hide)
            })
        }
        resolve()
    })
}

function getClubName(clubId) {
    return sendRequest('GET', `/v1/club/${clubId}`, headers)
}

function createPaymentsEmptyMessage() {

}

function createPaymentsPage(id, data) {
    return new Promise((resolve) => {
        const content = data.content
        if (content.length > 0) {
            function paymentsPageCycle(index, maxIndex, element) {
                let clubId = element.paymentInfo.clubId
                getClubName(clubId)
                    .then(response => {
                        const name = response.name
                        if (name !== undefined) {
                            createPaymentItem(element, name)
                                .then(function () {
                                    if ((index + 1) <= maxIndex) {
                                        index = index + 1
                                        paymentsPageCycle(index, maxIndex, content[index])
                                    } else resolve()
                                })
                        } else {
                            if ((index + 1) <= maxIndex) {
                                index = index + 1
                                paymentsPageCycle(index, maxIndex, content[index])
                            } else resolve()
                        }
                    })
            }

            let index = 0
            const maxIndex = content.length - 1
            paymentsPageCycle(index, maxIndex, content[0])
        } else {
            createPaymentsEmptyMessage()
        }
    })
        .then(function () {
                makeLinks(contentPlace.querySelectorAll('a'))
                if (id) {
                    return new Promise((resolve) => {
                        getClubName(id)
                            .then(response => {
                                const name = response.name
                                debugger
                                if (name !== undefined) {
                                    const thisPayment = getThisPayment(data.content, id)
                                    const requisiteModal = new Modal({
                                        content: `
                                       <div class="requisite-info">
                                                <h2 style="margin-bottom: 20px">Реквизиты для оплаты вступления</h2>
                                                <div class="requisite-info__item">
                                                    <span>Название клуба:</span>
                                                    <p class="requisite-info__value">${name}</p>
                                                </div>
                                                <div class="requisite-info__item">
                                                    <span>Имя владельца карты:</span>
                                                    <p class="requisite-info__value">${thisPayment.requisiteDTO.requisiteInfo.cardHolder}</p>
                                                </div>
                                                <div class="requisite-info__item">
                                                    <span>Номер карты:</span>
                                                    <p class="requisite-info__value">${thisPayment.requisiteDTO.requisiteInfo.cardNumber}</p>
                                                </div>
                                       </div>
                                    `,
                                    })
                                    setTimeout(() => {
                                        setTimeout(() => {
                                            Modal.show()
                                        }, 1500)
                                        resolve()
                                    }, 300)
                                }
                            })
                    })
                }
            })
}