const game = {
  start() {
    board.clear()
    board.adders.forEach(adderId => clearTimeout(adderId))
    board.adders = []
    timer.start(10000)
    points.show()
    board.addBlocks(7)
  },
  end() {
    if (!points.amount) return
    endGameModal.showModal()
    scoreView.innerText = points.amount
  },
  pause() {},
  continue() {},

}

const board = {
  blockTypes: {
    normal: {size: 45, color: 120, reward: 1},
  },
  addBlock(type='normal') {
    const {size, color} = board.blockTypes[type]
    const block = document.createElement('div')
    block.classList.add('block', type)
    block.dataset.type = type
    Object.assign(block.style, {
      width: `var(--${type})`,
      height: `var(--${type})`,
      background: `hsl(${color} ${30+genRndNum(45)}% ${30+genRndNum(45)}%)`,
      left: genRndNum(gameBoard.offsetWidth - size) + 'px',
      top: genRndNum(gameBoard.offsetHeight - size) + 'px',
    })
    gameBoard.append(block)
  },
  addBlocks(num, type='normal', delay=400) {
    const addProcedure = () => {
      if (timer.time < 0 || !num) {
        board.adders.forEach(adderId => clearTimeout(adderId))
        board.adders = []
        return
      }
      if (!timer.paused) {
        board.addBlock(type)
        num--
      }
      board.adders.push(setTimeout(addProcedure, delay))
    }
    board.adders.push(setTimeout(addProcedure, delay))
  },
  clear() {
    gameBoard.innerHTML = ''
  },
  adders: [],
}

const timer = {
  show() {
    timeView.parentElement.hidden = false
    timeView.innerText = ms2clock(timer.time)
  },
  hide() {
    timeView.parentElement.hidden = true
  },
  start(time=60000) {
    if (!timer.paused) timer.stop()
    timer.time = time
    timer.run()
    timer.show()
  },
  pause() {
    timer.paused = true
    clearInterval(timer.id)
    timer.time -= Date.now() - timer.lastUpdate
    timer.show()
  },
  run() {
    timer.paused = false
    timer.lastUpdate = Date.now()
    timer.id = setInterval(() => {
      const now = Date.now()
      timer.time -= now - timer.lastUpdate
      if (timer.time < 0) return timer.stop()
      timer.lastUpdate = now
      timer.show()
    }, timer.accuracy)
  },
  stop() {
    timer.paused = true
    clearInterval(timer.id)
    timer.time -= Date.now() - timer.lastUpdate
    timer.hide()
    game.end()
  },
  paused: true,
  accuracy: 300,
}

const points = {
  amount: 0,
  show() {
    pointsView.parentElement.hidden = false
    pointsView.innerText = points.amount
  },
  hide() {
    pointsView.parentElement.hidden = true
  },
  change(amount) {
    points.amount += amount
    points.show()
  },
  drop() {
    points.amount = 0
  },
}

const results = {
  scores: [],
  show() {
    resultList.innerHTML = results.scores.map(result => `
      <li>
        <span class="name">${result.name}</span>
        <span class="points">${result.score}</span>
      </li>
    `).join('')
  },
  add(name, score) {
    if (!name || !score) return
    results.scores.push({name, score})
    results.sort()
    results.show()
    results.save()
  },
  sort() {
    results.scores.sort((a, b) => {
      if (a.score == b.score) return 0
      return a.score > b.score ? -1 : 1
    })
  },
  save() {
    localStorage.removeBlocksGame_results = JSON.stringify(results.scores)
  },
  load() {
    if (!localStorage.removeBlocksGame_results) return
    results.scores = JSON.parse(localStorage.removeBlocksGame_results)
    results.show()
  },
}

results.load()

startBtn.onclick = () => {
  game.start()
  pauseBtn.hidden = false
}
pauseBtn.onclick = () => {
  if (timer.paused) {
    timer.run()
    pauseBtn.classList.remove('paused')
  } else {
    timer.pause()
    pauseBtn.classList.add('paused')
  }
}

gameBoard.onclick = e => {
  if (e.target.classList.contains('block')) {
    const block = e.target
    const {type} = block.dataset
    const {reward} = board.blockTypes[type]
    if (type == 'normal') {
      block.remove()
      points.change(+reward)
    }
  }
}
gameBoard.style = Object.entries(board.blockTypes)
  .map(([type, {size}]) => `--${type}: ${size}px`).join('; ')

saveResultBtn.onclick = () => {
  results.add(nameInput.value, +points.amount)
  endGameModal.close()
}
nameInput.onkeydown = e => {
  if (e.key == 'Enter') saveResultBtn.click()
}

function ms2clock(ms) {
  const min = String(ms/60000 | 0).padStart(2, 0)
  const sec = String((ms-min*60000)/1000 | 0).padStart(2, 0)
  return min+' : '+sec
}

function genRndNum(limit) {
  return Math.random() * limit | 0
}
