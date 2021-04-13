const GAME_STATE = {

  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",

}

const Symbols = [

  'https://image.flaticon.com/icons/svg/105/105223.svg',//黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg',//愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg',//方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' //梅花

  //52張牌直接用 0-51 來換算
  // 0 - 12：黑桃 1 - 13
  // 13 - 25：愛心 1 - 13
  // 26 - 38：方塊 1 - 13
  // 39 - 51：梅花 1 - 13
]

/*view是一個物件，物件裡的值要用“,”隔開*/
const view = {

  getElementbycards(index) {

    return `<div data-index="${index}" class="card back"> </div>`
  },

  getCardContent(index) {

    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
    <p>${number}</p>
      <img src="${symbol}" alt="卡片正片">
      <p>${number}</p>
       `

  }, /*逗號*/

  transformNumber(number) {
    switch (number) {

      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {

    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML =
      indexes.map(index =>
        this.getElementbycards(index)).join(" ") //join把陣列變成大字串，才能渲染給 .innerHTML

  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        //回傳正面 
        card.classList.remove('back')
        card.innerHTML =
          this.getCardContent(Number(card.dataset.index))
        return

      }
      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `

    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {

  revealedCards: [],  //是一個暫存牌組，使用者每次翻牌時，就先把卡片丟進這個牌組，集滿兩張牌時就要檢查配對有沒有成功，檢查完以後，這個暫存牌組就需要清空。
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0,

}

const controller = {

  currentState: GAME_STATE.FirstCardAwaits,    //定義初始狀態

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {

    if (!card.classList.contains('back')) {

      return // 此時卡片已經被翻開，不用做任何動作
    }
    switch (this.currentState) {

      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        //Times
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷是否成功
        if (model.isRevealedCardsMatched()) {
          //配對成功
          //Score
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGamefinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits //再重新配對

        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.restCards, 500)   //this.restCards 呼叫是本身 而不是 restCards() => 會回傳結果
        }
        //判斷兩張牌有沒有一樣
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('model. revealedCards:', model.revealedCards.map(card => card.dataset.index))

  },

  restCards() {
    //當把 restCards 當成參數傳入setTimeout時，
    //此時restCards裡的 “this”.currentState 是setTimeout！要改成 controller.currentState

    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}


//utility不包含MVC,屬於外掛函式庫通常用utility來命名！！
const utility = {

  getRandomNumberArray(count) {

    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {

      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] =
          [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()   //取代 view.displayCards()
document.querySelectorAll('.card').forEach(card => {

  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
