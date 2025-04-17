const textarea = document.querySelector('#insert-ask')
const askButton = document.querySelector('.asking-btn')
const initButton = document.querySelector('.chat-init-button')

const chatList = document.querySelector('.chat-contents-list')
let answerList = []
let answerId = 0
// let chatKey = null

// login part
const showLogin = true

function login () {
  const user = document.querySelector('.user-id').value
  const password = document.querySelector('.user-pw').value

  if (user && password) {
    getAcceseToken({ id: user, pw: password})
  }
  document.querySelector('.login-wrapper').innerHTML = user
}




textarea.addEventListener('input', function (e) {
  textarea.style.height = 'auto'
  textarea.style.height = e.target.scrollHeight + 'px'
})

textarea.addEventListener('keydown', function (e) {
  if (!textarea.value) return
// press enter only
  if(e.keyCode === 13 && !e.shiftKey) {
    e.preventDefault()
    runAskQuestion()
  }
})

function runAskQuestion () {
  createMessage('ask')
  answerUserAsk(textarea.value)
  textarea.value = ''
}

// 채팅창 초기화
function initchatList () {
  const items = document.querySelectorAll('.contents-item')

  items.forEach((item) => {
    if (!item.classList.contains('intro')){
      item.remove()
    } 
  })
  answerList = []
}
// 생성 멈추기 버튼 show/hide
function togglePauseBtn (state) {
  const pause = document.querySelector('.pause-btn')
  if (state) {
    pause.style.display = 'none'
  } else {
    pause.style.display = 'flex'
  }
}

// 컨텐츠 (프로필 + 메세지 박스) 생성 및 목록에 추가
function createMessage (type) {
  const message = type === 'ask' ? textarea.value : ''
  const chatItem = createContentsItem(type, message)
  chatList.prepend(chatItem)
  return chatItem
}

// 컨텐츠 생성
function createContentsItem (type = 'answer', text) {
  const container = document.createElement('div')
  container.classList.add('contents-item', type === 'ask' ? 'user-ask' : 'knit-answer')

  const profile =  setProfile(type, 'admin')
  container.appendChild(profile)

  const detail =  document.createElement('div')
  detail.classList.add('chat-detail')

  const user = document.createElement('div')
  user.classList.add('user-name')
  user.textContent = type === 'ask' ? '나' : 'UX GPT'
  detail.appendChild(user)

  const contents = document.createElement('div')
  contents.classList.add('chat-detail-contents')
  contents.textContent = text

  detail.appendChild(contents)

  container.appendChild(detail)
  
  return container
}

// 프로필 컨텐츠 생성
function setProfile(type, name) {
  const profile =  document.createElement('div')
  profile.classList.add('chat-profile')
  if (type === 'ask') {
    const letter = name.substr(0, 1).toUpperCase()
    profile.textContent = letter
  }
  return profile
}

// API
let newItem = ''
const api_url = 'https://staging-beeagle-api.beusable.net'
let accessToken = '' /* accessToken */
const aborter = new AbortController()

async function getAcceseToken (userInfo) {
  const url = api_url + '/user/login'
  const payload = {
    user_id: userInfo.id,
    user_password: userInfo.pw
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json()
    accessToken = json.data.accessToken
  } catch(err) {
    console.log(err)
  }
}
// async function getChatbotKey () {
//   const url = api_url + '/chatbot/get_chatbot_key'
//   try {
//     const response = await fetch(url)
//     if (!response.ok) {
//       throw new Error(`Response status: ${response.status}`);
//     }
//     const json = await response.json()
//     chatKey = json.data.chatbotKey
//   } catch(err) {
//     console.log(err)
//   }
// }

// 질문하기 api 요청(test)
// async function answerAsk (ask) {
//   if (!chatKey) return
//   newItem = createMessage('answer')
//   newItem.classList.add('loading')
//   togglePauseBtn(false)
//   const url = api_url + '/chatbot/chat'
//   const payload = {
//     question: ask,
//     chatbotKey: chatKey
//   }
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       body: JSON.stringify(payload),
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       signal: aborter.signal
//     })
//     if (!response.ok) {
//       throw new Error(`Response status: ${response.status}`);
//       togglePauseBtn(true)
//     }
//     const reader = response.body.getReader()
//     const decoder = new TextDecoder();
//     let resData = ''
//     while(true) {
//       const {done, value} = await reader.read()
//       if (done) {
//         newItem.classList.remove('loading')
//         togglePauseBtn(true)
//         break
//       }      
//       const decodedData = decoder.decode(value, { stream: true });
//       resData += decodedData
//       console.log(resData, decodedData)
//       newItem.querySelector('.chat-detail-contents').innerHTML = marked.parse(resData)
//     }
//   } catch(err) {
//     console.log(err)
//     if (err.name === 'AbortError') {
//       newItem.querySelector('.chat-detail-contents').innerHTML = "답변 생성이 취소되었습니다."
//       newItem.classList.remove('loading')
//       togglePauseBtn(true)
//     }
//   }
// }

// 생성 멈추기
function stopAnswer () {
  aborter.abort()
}

// 질문하기 api 요청
async function answerUserAsk (ask) {
  newItem = createMessage('answer')
  newItem.classList.add('loading')
  togglePauseBtn(false)
  const url = api_url + '/playground/chat'
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  
  }
  const data = {
    info : {
      asker_id: 'admin',
    },
    question: ask
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headers,
      credentials: 'include',
      signal: aborter.signal
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      togglePauseBtn(true)
    }
    newItem.classList.remove('loading')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder();
    let resData = ''
    while(true) {
      const {done, value} = await reader.read()
      togglePauseBtn(true)
      if (done) {
        break
      }      
      const decodedData = decoder.decode(value, { stream: true });
      resData += decodedData
      newItem.querySelector('.chat-detail-contents').innerHTML = marked.parse(resData)

      answerList.push({id: answerId, data: resData})
      newItem.setAttribute("id", answerId)
      answerId++
      console.log(answerList)
    }
  } catch(err) {
    console.log(err)
    if (err.name === 'AbortError') {
      newItem.querySelector('.chat-detail-contents').innerHTML = "답변 생성이 취소되었습니다."
      newItem.classList.remove('loading')
      togglePauseBtn(true)
    }
  }
}

// const userInfo = {
//   id: '',
//   pw: ''
// }
// getChatbotKey()
// getAcceseToken(userInfo)