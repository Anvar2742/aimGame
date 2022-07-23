const startBtn = document.querySelector('#start')
const screens = document.querySelectorAll('.screen')
const timeList = document.querySelector('#timeList')
const menu = document.querySelector('.menu')
const menuTime = document.querySelector('#menuTime')
const menuBar = document.querySelector('.menu__bar')
const close = document.querySelector('.close')
const timeEl = document.querySelector('#time')
const timeBtns = document.querySelectorAll('.menu .time-btn')
const board = document.querySelector('#board')
const realtimeScore = document.querySelector('.realtime-score')
const topPlayersTable = document.querySelector('.top__players')
const registr = document.querySelector('.registr')
const nameInput = document.querySelector('#name')
const startAudio = new Audio("simon.mp3")
const audio = new Audio("tap.mp3")
const screenBorad = document.querySelector('.screen-board')
let chosenTime = 0
let time = 0
let score = 0
let scoreFirst = 0
let scoreSec = 0
let scoreThird = 0
let gameInterval

// Check if user is already registered
const cookieName = getCookie('name')
if (cookieName) {
    registr.innerHTML = `<h2>Welcome, ${cookieName}!</h2>`
}

startBtn.addEventListener('click', (event) => {
    event.preventDefault()
    let name
    if (cookieName) {
        name = cookieName
    } else {
        name = nameInput.value
    }
    if (name) {
        screens[0].classList.add('up')
        startAudio.play()
        localStorage.setItem('name', name);
        // Apply setCookie
        setCookie('name', name, 30);
    }
})

timeList.addEventListener('click', (event) => {
    if (event.target.classList.contains('time-btn')) {
        time = +(event.target.getAttribute('data-time'))
        chosenTime = +(event.target.getAttribute('data-time'))
        screens[1].classList.add('up')
        startGame()
    }
})

menuTime.addEventListener('click', (event) => {
    if (event.target.classList.contains('time-btn')) {
        chosenTime = +(event.target.getAttribute('data-time'))

        timeBtns.forEach(el => {
            el.classList.remove('active')
        });
        event.target.classList.add('active')

        getData()
    }
})

menuBar.addEventListener('click', (event) => {
    menu.classList.add('active')
    clearInterval(gameInterval)

    if (chosenTime !== 0) {
        timeBtns.forEach(el => {
            el.classList.remove('active')

            if (+(el.getAttribute('data-time')) === chosenTime) {
                el.classList.add('active')
            }
        });
    }
})

close.addEventListener('click', (event) => {
    menu.classList.remove('active')
    gameInterval = setInterval(decreaseTime, 1000)
})

board.addEventListener('click', event => {
    if (event.target.classList.contains('circle')) {
        score++
        realtimeScore.querySelector('.primary').innerHTML = score
        event.target.remove()
        createRandomCircle()
        audio.play()
    }
})

function startGame() {
    gameInterval = setInterval(decreaseTime, 1000)
    setTime(time)
    if (board.children.length > 0) {
        for (let i = 0; i < board.children.length; i++) {
            const el = board.children[i];
            el.remove()
        }
        const tryAgain = document.querySelector('.try_btn')
        tryAgain.remove()
        score = 0
        timeEl.parentElement.classList.remove('remove')
    }

    realtimeScore.classList.remove('hide')
    startAudio.play()
    createRandomCircle()
}

function decreaseTime() {
    if (time === 0) {
        finishGame()
    } else {
        let current = --time
        if (current < 10) {
            current = `0${time}`
        }
        setTime(current)
    }
}

function setTime(val) {
    timeEl.innerHTML = `00:${val}`
}

function finishGame() {
    timeEl.parentElement.classList.add('remove')
    board.innerHTML = `<h1>Score: <span class="primary">${score}</span></h1><button class="btn try_btn">Try Again!</button>`
    clearInterval(gameInterval)

    if (chosenTime === +(timeBtns[0].getAttribute('data-time'))) {
        scoreFirst = score
        localStorage.setItem('scoreFirst', scoreFirst);
    } else if (chosenTime === +(timeBtns[1].getAttribute('data-time'))) {
        scoreSec = score
        localStorage.setItem('scoreSec', scoreSec);
    } else {
        scoreThird = score
        localStorage.setItem('scoreThird', scoreThird);
    }

    const tryAgain = document.querySelector('.try_btn')
    tryAgain.addEventListener('click', event => {
        for (let i = 1; i < screens.length; i++) {
            const el = screens[i];
            el.classList.remove('up')
        }
        startAudio.play()
    })

    realtimeScore.classList.add('hide')
    realtimeScore.querySelector('.primary').innerHTML = 0
    getData()
}

function createRandomCircle() {
    const circle = document.createElement('div')
    circle.classList.add('circle')
    const size = getRandomNum(20, 60)
    const {
        width,
        height
    } = board.getBoundingClientRect()
    const x = getRandomNum(0, width - size)
    const y = getRandomNum(0, height - size)

    circle.style.width = `${size}px`
    circle.style.height = `${size}px`
    circle.style.top = `${y}px`
    circle.style.left = `${x}px`

    board.append(circle)
}

function getRandomNum(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

const getData = () => {
    fetch('https://aim-game-a9de7-default-rtdb.europe-west1.firebasedatabase.app/db.json') //api for the get request
        .then(response => response.json())
        .then(data => {
            let match = data.findIndex(player => player.name == localStorage.getItem('name'))

            if (chosenTime === +(timeBtns[0].getAttribute('data-time'))) {
                if (match !== -1 && data[match].scoreFirst < scoreFirst) {
                    data[match].scoreFirst = scoreFirst
                }
            } else if (chosenTime === +(timeBtns[1].getAttribute('data-time'))) {
                if (match !== -1 && data[match].scoreSec < scoreSec) {
                    data[match].scoreSec = scoreSec
                }
            } else {
                if (match !== -1 && data[match].scoreThird < scoreThird) {
                    data[match].scoreThird = scoreThird
                }
            }

            let id = data[data.length - 1].id + 1

            if (match == -1) {
                let playerObj = {
                    id: id,
                    name: localStorage.getItem('name'),
                    scoreFirst: scoreFirst,
                    scoreSec: scoreSec,
                    scoreThird: scoreThird
                }
                data.push(playerObj)
            }
            // db sort
            function byField(field) {
                return (a, b) => a[field] > b[field] ? -1 : 1;
            }

            // Table render
            topPlayersTable.querySelectorAll('tr').forEach(el => {
                el.remove()
            })

            topPlayersTable.querySelector('thead').insertAdjacentHTML('beforeEnd', `
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Best Score</th>
                </tr>
            `)

            if (chosenTime === 10) {
                data.sort(byField('scoreFirst'));
                data.forEach((player, index) => {
                    topPlayersTable.querySelector('tbody').insertAdjacentHTML('beforeEnd', `
                    <tr>
                        <td>${++index}</td>
                        <td>${player.name}</td>
                        <td>${player.scoreFirst !== undefined ? player.scoreFirst : 0}</td>
                    </tr>
                `)
                })
            } else if (chosenTime === 20) {
                data.sort(byField('scoreSec'));
                data.forEach((player, index) => {
                    topPlayersTable.querySelector('tbody').insertAdjacentHTML('beforeEnd', `
                        <tr>
                            <td>${++index}</td>
                            <td>${player.name}</td>
                            <td>${player.scoreSec !== undefined ? player.scoreSec : 0}</td>
                        </tr>
                    `)
                })
            } else {
                data.sort(byField('scoreThird'));
                data.forEach((player, index) => {
                    topPlayersTable.querySelector('tbody').insertAdjacentHTML('beforeEnd', `
                        <tr>
                            <td>${++index}</td>
                            <td>${player.name}</td>
                            <td>${player.scoreThird !== undefined ? player.scoreThird : 0}</td>
                        </tr>
                    `)
                })
            }
            // db post
            postData(data)
        });


}


function postData(data) {
    fetch('https://aim-game-a9de7-default-rtdb.europe-west1.firebasedatabase.app/db.json', {
        method: 'PUT',
        body: JSON.stringify(data), // The data
    }).then((res) => res.json())
}

// Set a Cookie
function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}

// Get a cookie
function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}