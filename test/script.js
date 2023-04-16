const chatbox = document.getElementById('chatbox');
const input = document.getElementById('input');
const submitBtn = document.getElementById('submit');

let messages = [{ "role": "assistant", "content": 'the secret number is 22' }];

// Generate a random session ID
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
