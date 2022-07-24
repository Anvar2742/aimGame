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
const timeLeft = document.querySelector('.time_left')
let countDownEl = document.querySelector('.countdown')
const startAudio = new Audio("sounds/simon.mp3")
const audio = new Audio("sounds/tap_sound.mp3")
const countSound = new Audio("sounds/countdown.mp3")
const screenBorad = document.querySelector('.screen-board')
let chosenTime = 0
let chosenTimeMenu = 0
let time = 0
let score = 0
let scoreFirst = 0
let scoreSec = 0
let scoreThird = 0
let gameInterval
let countTime = 2
let startInterval
let interval = 1000
const firebase = 'https://aim-game-a9de7-default-rtdb.europe-west1.firebasedatabase.app/db.json'

// Check if has cookies
const cookieName = getCookie('name')
if (cookieName) {
    registr.innerHTML = `<h2>Welcome, ${cookieName}!</h2>`
}

nameInput.addEventListener('input', (event) => {
    let maxLength = +(nameInput.getAttribute('maxlength'))
    const errorInput = document.querySelector('.error_input')
    if (nameInput.value.length === maxLength) {
        errorInput.innerHTML = `Limit is ${maxLength} characters;)`
    } else {
        errorInput.innerHTML = ``
    }
})

startBtn.addEventListener('click', (event) => {
    event.preventDefault()
    let name = nameInput.value
    if (cookieName) {
        screens[0].classList.add('up')
        startAudio.play()
        localStorage.setItem('name', cookieName)
    } else {
        checkName(name)
    }
})

timeList.addEventListener('click', (event) => {
    if (event.target.classList.contains('time-btn')) {
        time = +(event.target.getAttribute('data-time'))
        chosenTime = +(event.target.getAttribute('data-time'))
        countTime = 2

        screens[1].classList.add('up')
        setTimeout(() => {
            countDownEl = document.querySelector('.countdown')

            countDownEl.classList.remove('remove')
            countSound.play()
            countSound.playbackRate = 1.1
            startInterval = setInterval(countDown, interval)
            setTimeout(() => {
                countDownEl.querySelector('span').classList.add('scale_zero')
            }, 450);
            setTimeout(() => {
                countDownEl.querySelector('span').classList.add('hide')
            }, 650);

            setTimeout(() => {
                countDownEl.querySelector('span').innerHTML = 3
                clearInterval(startInterval)
                startGame()
            }, 3000);
        }, 500);
    }
})

menuTime.addEventListener('click', (event) => {
    if (event.target.classList.contains('time-btn')) {
        chosenTimeMenu = +(event.target.getAttribute('data-time'))

        timeBtns.forEach(el => {
            el.classList.remove('active')
        });
        event.target.classList.add('active')



        // Table render
        tableRender()
    }
})

menuBar.addEventListener('click', (event) => {
    menu.classList.add('active')
    startAudio.play()
    clearInterval(gameInterval)
})

close.addEventListener('click', (event) => {
    menu.classList.remove('active')

    timeBtns.forEach(el => {
        el.classList.remove('active')
    });
    gameInterval = setInterval(decreaseTime, interval)
    topPlayersTable.querySelectorAll('tr').forEach(el => {
        el.remove()
    })
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
    timeLeft.classList.remove('remove')
    gameInterval = setInterval(decreaseTime, interval)
    setTime(time)
    const tryAgain = document.querySelector('.try_btn')
    if (board.children.length > 0 && tryAgain) {
        for (let i = 0; i < board.children.length; i++) {
            const el = board.children[i];
            el.remove()
        }
        tryAgain.remove()
        score = 0
        timeEl.parentElement.classList.remove('remove')
    }

    countDownEl.classList.add('remove')
    realtimeScore.classList.remove('hide')
    // startAudio.play()
    // startAudio.playbackRate = .3
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

function countDown() {

    let counterTime = document.createElement('span')
    counterTime.innerHTML = countTime
    countDownEl.append(counterTime)
    if (countTime === 0) {
        counterTime.classList.add('hide')
    }
    setTimeout(() => {
        counterTime.classList.add('scale_zero')
    }, 500);
    setTimeout(() => {
        counterTime.classList.add('hide')
    }, 650);

    countTime--
    return countTime
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
        if (board.children.length > 0) {
            for (let i = 0; i < board.children.length; i++) {
                const el = board.children[i];
                el.remove()
            }

            tryAgain.remove()
            score = 0
        }
        for (let i = 1; i < screens.length; i++) {
            const el = screens[i];
            el.classList.remove('up')
        }
        startAudio.play()
        board.innerHTML = '<div class="countdown primary remove"><span>3</span></div>'
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
    fetch('firebase') //api for the get request
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
            // db post
            postData(data)
        });


}

function checkName(name) {
    fetch('firebase') //api for the get request
        .then(response => response.json())
        .then(data => {
            const randomNames = ['Cool Kiddo', 'Lazy Cat', 'Stalin', 'Makarena', 'Chaka Paka', 'Alpaka']
            let match = data.findIndex(player => player.name == name)
            if (name.trim().length === 0) {
                alert("You need a name!")

                nameInput.value = randomNames[Math.floor(Math.random() * randomNames.length)]
            } else {
                if (match === -1) {
                    createPlayer()
                    screens[0].classList.add('up')
                    startAudio.play()
                    localStorage.setItem('name', name);
                    // Apply setCookie
                    setCookie('name', name, 30);
                } else {
                    alert('Name already exists!')
                }
            }
        })
}

function createPlayer() {
    fetch('firebase') //api for the get request
        .then(response => response.json())
        .then(data => {
            let id = 0
            data.forEach((player) => {
                if (id < player.id + 1) {
                    id = player.id + 1
                }
            })


            let playerObj = {
                id: id,
                name: localStorage.getItem('name'),
                device: deviceType(),
                scoreFirst: scoreFirst,
                scoreSec: scoreSec,
                scoreThird: scoreThird
            }
            data.push(playerObj)
            // db post
            postData(data)
        });
}

function tableRender() {
    fetch(firebase) //api for the get request
        .then(response => response.json())
        .then(data => {

            // db sort
            function byField(field) {
                return (a, b) => a[field] > b[field] ? -1 : 1;
            }
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

            if (chosenTimeMenu === +(timeBtns[0].getAttribute('data-time'))) {
                data.sort(byField('scoreFirst'));

                data.forEach((player, index) => {
                    topPlayersTable.querySelector('tbody').insertAdjacentHTML('beforeEnd', `
                <tr>
                    <td>${++index}</td>
                    <td><div class="name__td">
                        ${player.name + detectImg(player.device)}                    
                    </div></td>
                    <td>${player.scoreFirst !== undefined ? player.scoreFirst : 0}</td>
                </tr>
            `)
                })
            } else if (chosenTimeMenu === +(timeBtns[1].getAttribute('data-time'))) {
                data.sort(byField('scoreSec'));

                data.forEach((player, index) => {
                    topPlayersTable.querySelector('tbody').insertAdjacentHTML('beforeEnd', `
                <tr>
                    <td>${++index}</td>
                    <td><div class="name__td">
                        ${player.name + detectImg(player.device)}                    
                    </div></td>
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
                    <td><div class="name__td">
                        ${player.name + detectImg(player.device)}                    
                    </div></td>
                    <td>${player.scoreThird !== undefined ? player.scoreThird : 0}</td>
                </tr>
            `)
                })
            }
        });
}


function postData(data) {
    fetch('firebase', {
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

const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
};

function detectImg(playerDevice) {
    let deviceImg
    if (playerDevice === "mobile") {
        deviceImg = "<img src='icons/phone.svg'>"
    } else if (playerDevice === "desktop") {
        deviceImg = "<img src='icons/desktop.svg'>"
    } else if (playerDevice === "tablet") {
        deviceImg = "<img src='icons/tablet.svg'>"
    } else {
        deviceImg = ""
    }

    return deviceImg
}

function resetAll() {
    screens.forEach(el => {
        el.classList.remove('up')
    })
}

resetAll()

const deleteAllCookies = () => {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

// deleteAllCookies()


console.log('%cDeveloped by Anvar Musaev', "color: #fff; font-size: 16px; background: #000; padding: 5px;")