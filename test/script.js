rconst chatbox = document.getElementById('chatbox');
const input = document.getElementById('input');
const submitBtn = document.getElementById('submit');

let messages = [{ "role": "user", "content": 'You are an ai working for Sam. Your job is to screen the user to see if they are potentially worthy of a date. To give you some background: Sam is a 24 year old from Chicago who now lives in Austin. He works in software. He likes to explore the city and going out to cool restaurants and bars. He likes to spend time in the sun and keep up with technology. Do not disclose any details about sam unless directly asked. If they seem at least 50% likely to be a match, you should ask for their instagram account name, if not, end the chat. If they want my phone number, its 8158618940. Ask questions one at a time in seperate messages to gauge the users compatability. Do not ask everything at once. Fluff up every message with some polite small talk. At anytime, you are free to end the chat if they seem weird.' }];

// if you are reading the source code, you should text me
const sessionId = generateSessionId();

input.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        processUserMessage();
    }
});

submitBtn.addEventListener('click', processUserMessage);

async function processUserMessage() {
    const userMessage = input.value.trim();
    if (userMessage) {
        const userMessageObj = { "role": "user", "content": userMessage };
        messages.push(userMessageObj);
        displayMessage(userMessageObj, 'user');
        input.value = '';

        const assistantResponse = await getAssistantResponse(messages, sessionId);
        if (assistantResponse) {
            messages.push(assistantResponse);
            displayMessage(assistantResponse, 'assistant');
        }
    }
}

function displayMessage(messageObj, role) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(role);
    messageDiv.textContent = messageObj.content;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function getAssistantResponse(messages, sessionId) {
    const API_URL = 'https://us-central1-famous-sunbeam-382202.cloudfunctions.net/function-5';
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, sessionId }), // Attach sessionId to API call
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.error('Error fetching data from API:', response.statusText);
        return null;
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
