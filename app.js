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
let chosenTimeMenu = 0
let time = 0
let score = 0
let scoreFirst = 0
let scoreSec = 0
let scoreThird = 0
let gameInterval
let interval = 1000
let deviceImg

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
        chosenTimeMenu = +(event.target.getAttribute('data-time'))

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
})

close.addEventListener('click', (event) => {
    menu.classList.remove('active')

    timeBtns.forEach(el => {
        el.classList.remove('active')
    });
    gameInterval = setInterval(decreaseTime, interval)
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
    gameInterval = setInterval(decreaseTime, interval)
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
                    device: window.mobileCheck(),
                    scoreFirst: scoreFirst,
                    scoreSec: scoreSec,
                    scoreThird: scoreThird
                }
                data.push(playerObj)
            }
            // Table render
            tableRender(data)
            // db post
            postData(data)
        });


}


function tableRender(data) {

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
            if (window.mobileCheck()) {
                deviceImg = "<img src='phone.svg'>"
            } else {
                deviceImg = "<img src='desktop.svg'>"
            }
            topPlayersTable.querySelector('tbody').insertAdjacentHTML('beforeEnd', `
            <tr>
                <td>${++index}</td>
                <td><div class="name__td">
                    ${player.name + deviceImg}                    
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
                        ${player.name + deviceImg}                    
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
                        ${player.name + deviceImg}                    
                    </div></td>
                    <td>${player.scoreThird !== undefined ? player.scoreThird : 0}</td>
                </tr>
            `)
        })
    }
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


window.mobileCheck = function () {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};