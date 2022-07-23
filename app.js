const startBtn = document.querySelector('#start')
const screens = document.querySelectorAll('.screen')
const timeList = document.querySelector('.time-list')
const timeEl = document.querySelector('#time')
const board = document.querySelector('#board')
const startAudio = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3")
const audio = new Audio("tap.mp3")
const screenBorad = document.querySelector('.screen-board')
let time = 0
let score = 0
var gameInterval

startBtn.addEventListener('click', (event) => {
    event.preventDefault()
    screens[0].classList.add('up')
    startAudio.play()
})

timeList.addEventListener('click', (event) => {
    if (event.target.classList.contains('time-btn')) {
        time = +(event.target.getAttribute('data-time'))
        screens[1].classList.add('up')
        startGame()
    }
})

board.addEventListener('click', event => {
    if (event.target.classList.contains('circle')) {
        score++
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


    const tryAgain = document.querySelector('.try_btn')
    tryAgain.addEventListener('click', event => {
        for (let i = 1; i < screens.length; i++) {
            const el = screens[i];
            el.classList.remove('up')
        }
        startAudio.play()
    })
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

fetch('https://jsonplaceholder.typicode.com/todos/1') //api for the get request
    .then(response => response.json())
    .then(data => console.log(data));