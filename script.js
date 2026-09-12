document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const currentViewTitle = document.getElementById('currentViewTitle');
    
    // Selectors
    const semesterSelect = document.getElementById('semesterSelect');
    const subjectSelect = document.getElementById('subjectSelect');

    // Chat Elements
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const qpButtons = document.querySelectorAll('.qp-btn');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyList = document.getElementById('historyList');

    // MCQ Elements
    const generateMcqsBtn = document.getElementById('generateMcqsBtn');
    const mcqSetupForm = document.getElementById('mcqSetupForm');
    const mcqActiveBox = document.getElementById('mcqActiveBox');
    const mcqQuestionContainer = document.getElementById('mcqQuestionContainer');
    const mcqCounter = document.getElementById('mcqCounter');
    const mcqScoreTracker = document.getElementById('mcqScoreTracker');
    const mcqActions = document.getElementById('mcqActions');
    const nextMcqBtn = document.getElementById('nextMcqBtn');
    const mcqResultsBox = document.getElementById('mcqResultsBox');
    const mcqFinalScoreText = document.getElementById('mcqFinalScoreText');
    const restartMcqBtn = document.getElementById('restartMcqBtn');

    // Quiz Elements
    const startQuizBtn = document.getElementById('startQuizBtn');
    const quizSetupForm = document.getElementById('quizSetupForm');
    const quizActiveBox = document.getElementById('quizActiveBox');
    const quizQuestionBox = document.getElementById('quizQuestionBox');
    const quizQuestionCounter = document.getElementById('quizQuestionCounter');
    const quizTimerDisplay = document.getElementById('quizTimerDisplay');
    const quizPrevBtn = document.getElementById('quizPrevBtn');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const quizSubmitBtn = document.getElementById('quizSubmitBtn');
    const quizResultsBox = document.getElementById('quizResultsBox');
    const quizScoreSummary = document.getElementById('quizScoreSummary');
    const retakeQuizBtn = document.getElementById('retakeQuizBtn');

    // Viva Elements
    const startVivaBtn = document.getElementById('startVivaBtn');
    const vivaSetupBox = document.getElementById('vivaSetupBox');
    const vivaSessionBox = document.getElementById('vivaSessionBox');
    const vivaQABox = document.getElementById('vivaQABox');
    const vivaAnswerInput = document.getElementById('vivaAnswerInput');
    const submitVivaAnswerBtn = document.getElementById('submitVivaAnswerBtn');
    const endVivaBtn = document.getElementById('endVivaBtn');

    // Notes Elements
    const noteFileInput = document.getElementById('noteFileInput');
    const notesGrid = document.getElementById('notesGrid');

    // App State
    let currentChatId = 'chat_' + Date.now();
    let chatHistoryData = JSON.parse(localStorage.getItem('bsn_chat_history') || '{}');
    let savedNotes = JSON.parse(localStorage.getItem('bsn_saved_notes') || '[]');

    // Theme Initialization
    const savedTheme = localStorage.getItem('bsn_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('bsn_theme', newTheme);
        updateThemeUI(newTheme);
    });

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            themeText.textContent = 'Dark Mode';
        }
    }

    // Mobile Sidebar Toggle
    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    });

    closeSidebarBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }

    // Navigation Switching
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            viewSections.forEach(sec => sec.classList.remove('active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            currentViewTitle.textContent = item.textContent.trim();

            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    // Chat Management & API Communication
    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-user-nurse"></i>';
        
        const body = document.createElement('div');
        body.className = 'message-body';
        body.innerHTML = `<p>${formatText(text)}</p>`;

        if (sender === 'ai') {
            const disclaimer = document.createElement('span');
            disclaimer.className = 'disclaimer-tag';
            disclaimer.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Educational aid only. Not a clinical instructor substitute.';
            body.appendChild(disclaimer);
        }

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(body);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    async function sendToBackend(prompt, systemContext = '') {
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    semester: semesterSelect.value,
                    subject: subjectSelect.value,
                    systemContext: systemContext
                })
            });

            if (!response.ok) throw new Error('Failed to connect to AI server.');
            const data = await response.json();
            typingIndicator.style.display = 'none';
            return data.reply;
        } catch (error) {
            typingIndicator.style.display = 'none';
            return "Unable to connect to the AI service. Please try again or check your backend connection.";
        }
    }

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        appendMessage('user', text);

        const aiResponse = await sendToBackend(text);
        appendMessage('ai', aiResponse);
        saveCurrentChat(text, aiResponse);
    }

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    qpButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.getAttribute('data-prompt');
            chatInput.value = preset;
            chatInput.focus();
        });
    });

    // Chat History LocalStorage
    function saveCurrentChat(userText, aiText) {
        if (!chatHistoryData[currentChatId]) {
            chatHistoryData[currentChatId] = {
                title: userText.substring(0, 30) + '...',
                messages: []
            };
        }
        chatHistoryData[currentChatId].messages.push({ user: userText, ai: aiText });
        localStorage.setItem('bsn_chat_history', JSON.stringify(chatHistoryData));
        renderHistoryList();
    }

    function renderHistoryList() {
        historyList.innerHTML = '';
        Object.keys(chatHistoryData).forEach(id => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = chatHistoryData[id].title;
            item.addEventListener('click', () => {
                loadChatThread(id);
            });
            historyList.appendChild(item);
        });
    }

    function loadChatThread(id) {
        currentChatId = id;
        chatMessages.innerHTML = '';
        const thread = chatHistoryData[id];
        if (thread && thread.messages) {
            thread.messages.forEach(m => {
                appendMessage('user', m.user);
                appendMessage('ai', m.ai);
            });
        }
    }

    newChatBtn.addEventListener('click', () => {
        currentChatId = 'chat_' + Date.now();
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar"><i class="fa-solid fa-user-nurse"></i></div>
                <div class="message-body">
                    <p>New conversation started. How can I help with your ${subjectSelect.value} studies today?</p>
                </div>
            </div>`;
    });

    renderHistoryList();

    // 1. MCQ Generator Logic
    let currentMcqList = [];
    let mcqIndex = 0;
    let mcqScore = 0;

    generateMcqsBtn.addEventListener('click', async () => {
        const topic = document.getElementById('mcqTopic').value || subjectSelect.value;
        const count = document.getElementById('mcqCount').value;
        const difficulty = document.getElementById('mcqDifficulty').value;

        generateMcqsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        
        const prompt = `Generate exactly ${count} multiple choice questions for BSN nursing students on the topic: "${topic}". Difficulty: ${difficulty}. 
        Return ONLY valid JSON array without markdown formatting in this exact format:
        [
          {
            "question": "Sample question?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0,
            "explanation": "Why this is correct."
          }
        ]`;

        const response = await sendToBackend(prompt);
        generateMcqsBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Practice MCQs';

        try {
            // Clean response string
            const cleanedJSON = response.replace(/```json/g, '').replace(/```/g, '').trim();
            currentMcqList = JSON.parse(cleanedJSON);
            mcqIndex = 0;
            mcqScore = 0;

            mcqSetupForm.style.display = 'none';
            mcqActiveBox.style.display = 'block';
            renderMcqQuestion();
        } catch (e) {
            alert('Failed to parse AI MCQ output. Please try again.');
        }
    });

    function renderMcqQuestion() {
        if (mcqIndex >= currentMcqList.length) {
            mcqActiveBox.style.display = 'none';
            mcqResultsBox.style.display = 'block';
            mcqFinalScoreText.textContent = `You scored ${mcqScore} out of ${currentMcqList.length} (${Math.round((mcqScore/currentMcqList.length)*100)}%)`;
            return;
        }

        const q = currentMcqList[mcqIndex];
        mcqCounter.textContent = `Question ${mcqIndex + 1} of ${currentMcqList.length}`;
        mcqScoreTracker.textContent = `Score: ${mcqScore}`;
        mcqActions.style.display = 'none';

        let optionsHtml = '';
        q.options.forEach((opt, idx) => {
            optionsHtml += `<button class="option-btn" data-idx="${idx}">${opt}</button>`;
        });

        mcqQuestionContainer.innerHTML = `
            <div class="question-card">
                <h4>${q.question}</h4>
                <div class="options-list">${optionsHtml}</div>
                <div class="explanation-box" id="mcqExplanation" style="display:none;"><strong>Explanation:</strong> ${q.explanation}</div>
            </div>`;

        const optionButtons = mcqQuestionContainer.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedIdx = parseInt(e.target.getAttribute('data-idx'));
                optionButtons.forEach(b => b.disabled = true);

                if (selectedIdx === q.correct) {
                    e.target.classList.add('correct');
                    mcqScore++;
                } else {
                    e.target.classList.add('incorrect');
                    optionButtons[q.correct].classList.add('correct');
                }

                document.getElementById('mcqExplanation').style.display = 'block';
                mcqActions.style.display = 'block';
                mcqScoreTracker.textContent = `Score: ${mcqScore}`;
            });
        });
    }

    nextMcqBtn.addEventListener('click', () => {
        mcqIndex++;
        renderMcqQuestion();
    });

    restartMcqBtn.addEventListener('click', () => {
        mcqResultsBox.style.display = 'none';
        mcqSetupForm.style.display = 'flex';
    });

    // 2. Quiz Exam Mode Logic
    let quizList = [];
    let quizIndex = 0;
    let userAnswers = {};
    let timerInterval = null;

    startQuizBtn.addEventListener('click', async () => {
        const topic = document.getElementById('quizTopic').value || subjectSelect.value;
        const useTimer = document.getElementById('quizTimerOption').value === 'yes';

        startQuizBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing Exam...';
        
        const prompt = `Generate 10 exam-style multiple choice questions for BSN nursing students on: "${topic}". 
        Return ONLY valid JSON array without markdown formatting:
        [
          {
            "question": "Question text?",
            "options": ["A", "B", "C", "D"],
            "correct": 1,
            "explanation": "Explanation here."
          }
        ]`;

        const response = await sendToBackend(prompt);
        startQuizBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Exam Quiz';

        try {
            const cleanedJSON = response.replace(/```json/g, '').replace(/```/g, '').trim();
            quizList = JSON.parse(cleanedJSON);
            quizIndex = 0;
            userAnswers = {};

            quizSetupForm.style.display = 'none';
            quizActiveBox.style.display = 'block';
            renderQuizQuestion();

            if (useTimer) {
                startQuizTimer(quizList.length * 60);
            } else {
                quizTimerDisplay.style.display = 'none';
            }
        } catch (e) {
            alert('Failed to initialize quiz exam. Try again.');
        }
    });

    function startQuizTimer(duration) {
        let timer = duration;
        quizTimerDisplay.style.display = 'block';
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            let minutes = parseInt(timer / 60, 10);
            let seconds = parseInt(timer % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            quizTimerDisplay.innerHTML = `<i class="fa-solid fa-clock"></i> ${minutes}:${seconds}`;

            if (--timer < 0) {
                clearInterval(timerInterval);
                submitQuiz();
            }
        }, 1000);
    }

    function renderQuizQuestion() {
        const q = quizList[quizIndex];
        quizQuestionCounter.textContent = `Q ${quizIndex + 1}/${quizList.length}`;
        
        let optionsHtml = '';
        q.options.forEach((opt, idx) => {
            const isChecked = userAnswers[quizIndex] === idx ? 'checked' : '';
            optionsHtml += `
                <label class="option-btn" style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="radio" name="quiz_opt" value="${idx}" ${isChecked}> ${opt}
                </label>`;
        });

        quizQuestionBox.innerHTML = `
            <div class="question-card">
                <h4>${q.question}</h4>
                <div class="options-list">${optionsHtml}</div>
            </div>`;

        // Radio listeners
        quizQuestionBox.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                userAnswers[quizIndex] = parseInt(e.target.value);
            });
        });

        quizPrevBtn.style.display = quizIndex === 0 ? 'none' : 'inline-block';
        if (quizIndex === quizList.length - 1) {
            quizNextBtn.style.display = 'none';
            quizSubmitBtn.style.display = 'inline-block';
        } else {
            quizNextBtn.style.display = 'inline-block';
            quizSubmitBtn.style.display = 'none';
        }
    }

    quizPrevBtn.addEventListener('click', () => { if (quizIndex > 0) { quizIndex--; renderQuizQuestion(); } });
    quizNextBtn.addEventListener('click', () => { if (quizIndex < quizList.length - 1) { quizIndex++; renderQuizQuestion(); } });
    quizSubmitBtn.addEventListener('click', submitQuiz);

    function submitQuiz() {
        clearInterval(timerInterval);
        quizActiveBox.style.display = 'none';
        quizResultsBox.style.display = 'block';

        let score = 0;
        let reviewHtml = '';

        quizList.forEach((q, idx) => {
            const userAns = userAnswers[idx];
            const isCorrect = userAns === q.correct;
            if (isCorrect) score++;

            reviewHtml += `
                <div class="question-card" style="border-left: 4px solid ${isCorrect ? '#10b981' : '#ef4444'};">
                    <h4>Q${idx+1}: ${q.question}</h4>
                    <p>Your Answer: <strong>${userAns !== undefined ? q.options[userAns] : 'Not Answered'}</strong></p>
                    <p>Correct Answer: <strong>${q.options[q.correct]}</strong></p>
                    <p class="explanation-box"><em>${q.explanation}</em></p>
                </div>`;
        });

        quizScoreSummary.textContent = `Final Score: ${score} / ${quizList.length} (${Math.round((score/quizList.length)*100)}%)`;
        quizReviewList.innerHTML = reviewHtml;
    }

    retakeQuizBtn.addEventListener('click', () => {
        quizResultsBox.style.display = 'none';
        quizSetupForm.style.display = 'flex';
    });

    // 3. Viva Preparation Mode Logic
    let vivaTopic = '';
    let vivaQuestionCount = 0;

    startVivaBtn.addEventListener('click', async () => {
        vivaTopic = document.getElementById('vivaTopicInput').value || subjectSelect.value;
        vivaSetupBox.style.display = 'none';
        vivaSessionBox.style.display = 'block';
        vivaQABox.innerHTML = '';
        vivaQuestionCount = 1;

        const initialPrompt = `Act as a strict but supportive BSN nursing clinical instructor conducting an oral viva examination on the topic: "${vivaTopic}". Ask ONLY the first question now. Keep it professional and concise.`;
        const aiQ = await sendToBackend(initialPrompt);
        appendVivaMessage('ai', aiQ);
    });

    function appendVivaMessage(sender, text) {
        const msg = document.createElement('div');
        msg.className = `viva-msg ${sender}`;
        msg.innerHTML = `<strong>${sender === 'ai' ? 'Clinical Instructor' : 'You'}:</strong><br>${formatText(text)}`;
        vivaQABox.appendChild(msg);
        vivaQABox.scrollTop = vivaQABox.scrollHeight;
    }

    submitVivaAnswerBtn.addEventListener('click', async () => {
        const ans = vivaAnswerInput.value.trim();
        if (!ans) return;
        vivaAnswerInput.value = '';
        appendVivaMessage('user', ans);
        vivaQuestionCount++;

        const evaluationPrompt = `The nursing student answered: "${ans}". Evaluate this answer for a clinical viva on "${vivaTopic}", give constructive feedback, state what was missing, provide the ideal answer, and ask viva question number ${vivaQuestionCount}.`;
        const evaluation = await sendToBackend(evaluationPrompt);
        appendVivaMessage('ai', evaluation);
    });

    endVivaBtn.addEventListener('click', () => {
        vivaSessionBox.style.display = 'none';
        vivaSetupBox.style.display = 'block';
    });

    // 4. Notes & Document Hub
    noteFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const newNote = {
            name: file.name,
            date: new Date().toLocaleDateString(),
            size: (file.size / 1024).toFixed(1) + ' KB'
        };

        savedNotes.push(newNote);
        localStorage.setItem('bsn_saved_notes', JSON.stringify(savedNotes));
        renderNotes();
    });

    function renderNotes() {
        notesGrid.innerHTML = '';
        if (savedNotes.length === 0) {
            notesGrid.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No notes uploaded yet.</p>';
            return;
        }

        savedNotes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <h4><i class="fa-solid fa-file-lines" style="color:var(--primary);"></i> ${note.name}</h4>
                <span>Added: ${note.date} (${note.size})</span>
            `;
            notesGrid.appendChild(card);
        });
    }

    renderNotes();
});
