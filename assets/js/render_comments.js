window.processedComments = []
window.counter = 0

function renderReply(answerID) {
    if (processedComments[answerID]) {
        return `<div class="reply" data-answered="${processedComments[answerID].commentId}">
            <p><span class="reply-author">${processedComments[answerID].author.nick}</span> написал(а):</p>
            <p class="reply-text">${processedComments[answerID].text}</p>
        </div>`
    } else return 'Исходный комментарий отсутствует'
}

function createReply(answerID, commentId) {
    const replyPlace = document.querySelector('.write-reply')
    replyPlace.innerHTML = ''
    replyPlace.innerHTML = `<div class="reply-place visible">
                                <div class="write-reply__header">
                                    <h3 style="color: black!important;">Написать ответ на комментарий:</h3>
                                    <button class="write-reply__cancel">Отмена</button>
                                </div>
                                <div class="write-reply__comment" data-answer="${commentId}">
                                    ${renderReply(answerID)}
                                </div>
                            </div>
    `
    const fullHeight = replyPlace.querySelector('.reply-place').getBoundingClientRect().height
    setTimeout(() => {
        replyPlace.style.height = fullHeight + 'px'
        window.scroll(0, document.body.scrollHeight)
    }, 300)
    replyPlace.querySelector('button.write-reply__cancel').addEventListener('click', () => {
        replyPlace.style.height = '0'
        setTimeout(() => {
            replyPlace.innerHTML = ''
        }, 500)
    })
}

function renderSingleComment(comment, commentPlace) {
    return new Promise((resolve, reject) => {
        console.log(comment)
        let commentData = {
            author: {
                nick: '',
                avatar: '',
                date: ''
            },
            reply: {
                author: '',
                text: '',
                data: ''
            },
            text: '',
            commentId: ''
        }
        commentData.author.nick = comment.accountEmail
        commentData.author.avatar = (comment.accountEmail.slice(0, 1)).toUpperCase()
        commentData.author.date = (comment.created).slice(0, 16)
        commentData.commentId = comment.id
        if (comment.answered !== null) {
            commentData.reply.author = comment.answered.accountEmail
            commentData.reply.text = comment.answered.value
            commentData.reply.data = comment.answered.created
        }
        processedComments.push(commentData)
        const answerID = processedComments.indexOf(commentData)
        commentData.text = comment.value
        const commentElement = document.createElement('section')
        commentElement.classList.add('comment')
        commentElement.setAttribute('data-array-number', `${answerID}`)
        commentElement.innerHTML = `
                <div class="comment__content">
                   <div class="comment__body">
                     <div class="comment__user">
                         <div class="comment__user--avatar"><p>${commentData.author.avatar}</p></div>
                         <div>
                            <p class="comment__user--name">${commentData.author.nick}</p>
                            <p class="text-light">${commentData.author.date}</p>
                         </div>
                     </div>
                     <div class="comment__text">
                        <div class="reply-place">
                        </div>
                        <p>${commentData.text}</p>
                     </div>
                   </div>
                   <div class="comment__actions">
                     <div class="comment__actions--submenu">
                        <input id="" type="checkbox">
                                         <div class="comment__actions--submenu-body">
                                                <button>Написать</button>
                                                <button>Пожаловаться</button>
                                            </div>
                                            <label for="">
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
<style type="text/css">
\t.st0{fill:#668880;}
</style>
                                                    <g>
\t<circle class="st0" cx="50" cy="13.7" r="13.7"></circle>
                                                        <circle class="st0" cx="50" cy="50" r="13.7"></circle>
                                                        <circle class="st0" cx="50" cy="86.3" r="13.7"></circle>
</g>
</svg>
                                            </label>
                                        </div>
                                        <a href="#comment-form" class="comment__actions--reply">
                                            <svg fill="#668880" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="18px" height="14px" viewBox="0 0 45.58 45.58" xml:space="preserve">
<g>
\t<path d="M45.506,33.532c-1.741-7.42-7.161-17.758-23.554-19.942V7.047c0-1.364-0.826-2.593-2.087-3.113
\t\tc-1.261-0.521-2.712-0.229-3.675,0.737L1.305,19.63c-1.739,1.748-1.74,4.572-0.001,6.32L16.19,40.909
\t\tc0.961,0.966,2.415,1.258,3.676,0.737c1.261-0.521,2.087-1.75,2.087-3.113v-6.331c5.593,0.007,13.656,0.743,19.392,4.313
\t\tc0.953,0.594,2.168,0.555,3.08-0.101C45.335,35.762,45.763,34.624,45.506,33.532z"></path>
</g>
</svg>
                                            <p>Ответить</p>
                                        </a>
                     </div>
                </div>
            `
        commentPlace.insertAdjacentElement('beforeend', commentElement)
        if (comment.answered === null) {
            commentElement.setAttribute('data-reply-number', `none`)
        } else {
            commentElement.setAttribute('data-reply-number', `${comment.answered.id}`)
        }

        const replyButton = commentElement.querySelector('.comment__actions--reply')
        replyButton.setAttribute('data-answer', `${comment.id}`)
        replyButton.addEventListener('click', () => {
            createReply(answerID, replyButton.dataset.answer)
        })
        commentElement.style.height = (commentElement.querySelector('.comment__content')).scrollHeight + 30 + 'px'
        window.counter = window.counter + 1
        resolve()
    })
}

function sendComment(form, textField, commentPlace) {
    const reply = form.querySelector('.write-reply__comment')
    const body = {
        'value': `${textField.value}`
    }
    if (reply !== null) {
        body.answered = reply.dataset.answer
    }
    sendRequest('POST', `/v1/club/${clubPageData.clubInfo.clubID}/comment`, headers, JSON.stringify(body))
        .then(response => {
            // answered чтобы проверить, что пришел именно коммент
            renderSingleComment(response, commentPlace)
                .then(function () {
                        textField.value = ''
                        const replyPlace = document.querySelector('.write-reply')
                        replyPlace.style.height = '0'
                        setTimeout(() => {
                            replyPlace.innerHTML = ''
                        }, 500)
                        window.allComments = commentPlace.querySelectorAll('.comment')
                        processReplies(commentPlace, allComments)
                    })
        })
}

function renderComments(data, commentPlace) {
    console.log(data)
    renderSingleComment(data[window.counter], commentPlace)
        .then(function () {
            if (data[window.counter]) {
                renderComments(data, commentPlace)
            } else {
                const form = document.querySelector('.write')
                if (form) {
                    const textField = form.querySelector('textarea')
                    const button = document.querySelector('.write button')
                    button.addEventListener('click', () => {
                        sendComment(form, textField, commentPlace)
                    })
                    textField.addEventListener('input', () => {
                        if (textField.value.length > 0) {
                            button.classList.remove('disabled')
                        } else {
                            button.classList.add('disabled')
                        }
                    })
                }
                window.allComments = commentPlace.querySelectorAll('.comment')
                processReplies(commentPlace, allComments)
            }
        })
        .then(function() {
            const allComments = document.querySelectorAll('section.comment')
            allComments.forEach(element => {
                element.style.height = 'auto'
            })
        })
}

function processReplies(commentPlace, allComments) {
    // place replies
    allComments.forEach(comment => {
        if (comment.dataset.replyNumber !== "none") {
            let targetCommentInArray
            const repliedComment = processedComments.find(
                function (element) {
                    return String(comment.dataset.replyNumber) === String(element.commentId)
                })
            targetCommentInArray = processedComments.indexOf(repliedComment)
            processedComments[comment.dataset.arrayNumber].reply = {
                author: repliedComment.author.nick,
                text: repliedComment.text,
                data: repliedComment.author.date
            }
            const reply = comment.querySelector('.reply-place')
            reply.innerHTML = renderReply(targetCommentInArray)
            reply.classList.add('visible')

            const fullHeight = comment.querySelector('.comment__content').getBoundingClientRect().height + 30
            comment.setAttribute('style', `height: ${fullHeight + 'px'}`)
        }
    })

    // place id's for comment submenus
    for (let i = 0; i < allComments.length; i++) {
        let thisID = 'comment-submenu-' + (i + 1)
        allComments[i].querySelector('.comment__actions--submenu input[type="checkbox"]').id = thisID
        allComments[i].querySelector('.comment__actions--submenu label').setAttribute('for', thisID)
    }
}