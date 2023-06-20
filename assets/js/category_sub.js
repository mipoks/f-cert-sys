async function createSubCategoryList(data) {
    const subCategories = data.content
    const contentPlace = document.querySelector('.content')
    if (subCategories.length > 0) {
        for (let i = 0; i < subCategories.length; i++) {
            const newElement = `
                <section class="catalog-sub-category" data-type="category" id="${subCategories[i].id}">
                    <div class="catalog-sub-category__content">
                        <h2><a data-target="inner-content" id="${subCategories[i].id}" data-crumb="${subCategories[i].name}">${subCategories[i].name}</a></h2>
                        <p class="catalog-sub-category__description">${subCategories[0].description}</p>
                        <div class="rendered-list"></div>
                    </div>
                    <div class="catalog-category__link">
                                <button class="tools-edit disabled" title="Редактировать категорию" id="adminTools">
                                   <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 30 30" version="1.1">
                                            <g id="surface1">
                                            <path fill="#4e72e1" style="stroke:none;fill-rule:nonzero;fill-opacity:1;" d="M 22.773438 0.273438 C 22.949219 0.0976562 23.1875 0 23.4375 0 C 23.6875 0 23.925781 0.0976562 24.101562 0.273438 L 29.726562 5.898438 C 29.902344 6.074219 30 6.3125 30 6.5625 C 30 6.8125 29.902344 7.050781 29.726562 7.226562 L 10.976562 25.976562 C 10.886719 26.066406 10.777344 26.136719 10.660156 26.183594 L 1.285156 29.933594 C 0.9375 30.070312 0.539062 29.992188 0.273438 29.726562 C 0.0078125 29.460938 -0.0703125 29.0625 0.0664062 28.714844 L 3.816406 19.339844 C 3.863281 19.222656 3.933594 19.113281 4.023438 19.023438 Z M 21.011719 4.6875 L 25.3125 8.988281 L 27.738281 6.5625 L 23.4375 2.261719 Z M 23.988281 10.3125 L 19.6875 6.011719 L 7.5 18.199219 L 7.5 18.75 L 8.4375 18.75 C 8.957031 18.75 9.375 19.167969 9.375 19.6875 L 9.375 20.625 L 10.3125 20.625 C 10.832031 20.625 11.25 21.042969 11.25 21.5625 L 11.25 22.5 L 11.800781 22.5 Z M 5.683594 20.015625 L 5.484375 20.214844 L 2.621094 27.378906 L 9.785156 24.515625 L 9.984375 24.316406 C 9.617188 24.179688 9.375 23.828125 9.375 23.4375 L 9.375 22.5 L 8.4375 22.5 C 7.917969 22.5 7.5 22.082031 7.5 21.5625 L 7.5 20.625 L 6.5625 20.625 C 6.171875 20.625 5.820312 20.382812 5.683594 20.015625 Z M 5.683594 20.015625 "/>
                                            </g>
                                        </svg>
                                </button>
                                <a data-target="inner-content" id="${subCategories[i].id}" data-crumb="${subCategories[i].name}">Подробнее</a>
                            </div>
                </section>
            `
            contentPlace.insertAdjacentHTML('beforeend', newElement)
            // checking if there are subcategories
            const subCategoriesChildren = new XMLHttpRequest()
            subCategoriesChildren.open('GET', `http://localhost:8081/v1/categories?parent_id=${subCategories[i].id}`)
            subCategoriesChildren.setRequestHeader('Content-Type', 'application/json')
            subCategoriesChildren.send()
            subCategoriesChildren.onload = function () {
                const subContentList = document.createElement('ul')
                const responseSubCategories = (JSON.parse(subCategoriesChildren.response)).content
                const newDOMElement = findSection('category', `${subCategories[i].id}`)
                if (responseSubCategories.length > 0) {
                    if (responseSubCategories.length < 3) {
                        const clubsList = 3 - responseSubCategories.length
                        for (let x = 0; x < responseSubCategories.length; x++) {
                            if (responseSubCategories[x]) {
                                createSubContentList(responseSubCategories[x], subContentList, 'inner-content')
                            }
                        }
                        const newDOMElement = findSection('category', `${subCategories[i].id}`)
                        newDOMElement.querySelector('.rendered-list').insertAdjacentElement('beforeend', subContentList)

                        const getClubs = new XMLHttpRequest()
                        getClubs.open('GET', `http://localhost:8081/v1/clubs?category_id=${subCategories[i].id}&expired=false`)
                        getClubs.setRequestHeader('Content-Type', 'application/json')
                        getClubs.send()
                        getClubs.onload = function () {
                            if (getClubs.response !== "[]") {
                                const responseClubs = (JSON.parse(getClubs.response))
                                if (responseClubs.length > 0) {
                                    for (let z = 0; z < clubsList; z++) {
                                        if (responseClubs[z]) {
                                            createSubContentList(responseClubs[z], subContentList, 'club-page')
                                        }
                                    }
                                    newDOMElement.querySelector('.rendered-list').insertAdjacentElement('beforeend', subContentList)
                                    const links = newDOMElement.querySelectorAll('.rendered-list a')
                                    makeLinks(links)
                                }
                            }
                        }
                    }

                } else {
                    subContentList.innerHTML = '<p class="aside-text">Внутри нет вложенных категорий</p>'
                    newDOMElement.querySelector('.rendered-list').insertAdjacentElement('beforeend', subContentList)
                }
                const links = newDOMElement.querySelectorAll('a')
                makeLinks(links)
            }

        }
    }
}