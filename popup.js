document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const vipListElement = document.getElementById('vip-list');
    const onlineCountSpan = document.getElementById('online-count');

    // STORAGE KEYS
    const STORAGE_KEY = 'jazz_caffeine_history_v1';
    const STORAGE_KEY_STATE = 'jazz_caffeine_state_v1';

    // 1. Setup the 10 Approved Seats (Simulation)
    const approvedUsers = [
        'SaxMan', 'CoffeeQueen', 'NeonCat', 'RaveDave', 'BassDrop', 
        'Espresso', 'Glitch', 'VibeCheck', 'Psyche', 'Drummer'
    ];
    
    let onlineCount = 0;
    approvedUsers.forEach(user => {
        const slot = document.createElement('div');
        slot.classList.add('vip-slot');
        // Randomly decide who is online for the psychedelic vibe
        const isOnline = Math.random() > 0.6; 
        if (isOnline) {
            slot.classList.add('online');
            onlineCount++;
        }
        slot.innerText = user.substring(0, 3).toUpperCase();
        vipListElement.appendChild(slot);
    });
    onlineCountSpan.innerText = onlineCount;

    // === UPGRADE: LOAD HISTORY & RESTORE STATE ===
    chrome.storage.local.get([STORAGE_KEY, STORAGE_KEY_STATE], (result) => {
        // A. Load Chat History
        if (result[STORAGE_KEY]) {
            const history = JSON.parse(result[STORAGE_KEY]);
            history.forEach(msg => {
                renderMessage(msg.text, msg.sender === 'me' ? 'me' : 'them');
            });
        }

        // B. Restore State (Text Draft & Scroll Position)
        if (result[STORAGE_KEY_STATE]) {
            const state = result[STORAGE_KEY_STATE];
            if (state.draftText) messageInput.value = state.draftText;
            
            // Timeout needed to allow DOM to calculate heights
            setTimeout(() => {
                chatWindow.scrollTop = state.scrollTop;
            }, 50);
        } else {
            scrollToBottom();
        }
    });

    // === UPGRADE: SAVE STATE LISTENERS ===
    function saveState() {
        const state = {
            scrollTop: chatWindow.scrollTop,
            draftText: messageInput.value
        };
        chrome.storage.local.set({ [STORAGE_KEY_STATE]: state });
    }

    chatWindow.addEventListener('scroll', saveState);
    messageInput.addEventListener('input', saveState);

    // 3. Send Message Functionality
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;

        // Render & Save
        renderMessage(text, 'me');
        saveMessageLocal(text, 'me');
        
        // Clear input and update state
        messageInput.value = '';
        saveState(); 
        scrollToBottom();

        // Psychedelic Reply Simulation
        setTimeout(() => {
            const botReply = generateRaveBotReply();
            renderMessage(botReply, 'them');
            saveMessageLocal(botReply, 'RaveBot');
            scrollToBottom();
        }, 1500);
    }

    function renderMessage(text, type) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('message-row', type);
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.innerText = text;
        
        rowDiv.appendChild(bubbleDiv);
        chatWindow.appendChild(rowDiv);
    }

    function saveMessageLocal(text, sender) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            let history = [];
            if (result[STORAGE_KEY]) {
                history = JSON.parse(result[STORAGE_KEY]);
            }
            
            const newMessage = {
                text: text,
                sender: sender,
                timestamp: new Date().toISOString()
            };
            
            history.push(newMessage);
            
            chrome.storage.local.set({
                [STORAGE_KEY]: JSON.stringify(history)
            });
        });
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
        // Update state after auto-scroll
        setTimeout(saveState, 100); 
    }

    const botPhrases = [
        "The saxophone is melting, man.",
        "Did you put espresso in the lava lamp?",
        "Smooth jazz incoming...",
        "Wait, I hear colors.",
        "Keep the vibe tight. Only 10 seats.",
        "That input was pure caffeine.",
        "Bloop bleep *saxophone noise*.",
        "The blue light is speaking to me.",
        "Are you seeing these tracers?",
        "Pour another cup and turn up the bass."
    ];

    function generateRaveBotReply() {
        const randomIndex = Math.floor(Math.random() * botPhrases.length);
        return botPhrases[randomIndex];
    }
});