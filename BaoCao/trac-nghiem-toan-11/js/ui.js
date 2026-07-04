/**
 * ui.js - Ultimate High-Fidelity UI Controller
 */

const UIManager = (() => {
    // DOM Elements Registry
    const elements = {
        body: document.body,
        setupSection: null,
        loadingSection: null,
        quizSection: null,
        resultSection: null,
        
        displayName: null,
        leaderboardList: null,
        personalHistoryList: null,
        
        qNumber: null,
        progressBar: null,
        timer: null,
        questionText: null,
        optionsBox: null,
        quizNavigation: null,
        
        resScore: null,
        resTime: null,
        resAcc: null,
        reviewAccordion: null,

        // STEM Cascading Selectors
        gradeSelect: null,
        subjectSelect: null,
        topicSelect: null,

        // Mobile Sidebar
        sidebar: null,
        sidebarOverlay: null,
        mobileMenuBtn: null,

        // Settings Modal
        settingsModal: null,
        settingsTheme: null,
        settingsBlur: null,
        settingsFontScale: null,
        settingsSound: null,
        settingsApiKey: null,
        saveSettingsBtn: null,

        // History Review Modal
        reviewModal: null,
        reviewModalTitle: null,
        reviewModalContent: null,

        // Scratchpad
        scratchpadToggle: null,
        scratchpadWindow: null,
        scratchpadCanvas: null,
        scratchpadClear: null,
        scratchpadHeader: null,
        scratchpadResize: null
    };

    // Canvas drawing states
    let canvasCtx = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let brushColor = '#38bdf8'; // sky-400
    let brushWidth = 3;

    // Web Audio Synthesized Sound Engine (No files required!)
    let audioCtx = null;
    let soundEnabled = true;

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.1);
            } else if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, audioCtx.currentTime);
                osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
                osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.35);
            } else if (type === 'correct') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
                osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.3);
            } else if (type === 'incorrect') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, audioCtx.currentTime);
                osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.25);
            }
        } catch (e) {
            console.warn("Audio Context failed to play.", e);
        }
    }

    function init() {
        // Core elements
        elements.setupSection = document.getElementById('setup-section');
        elements.loadingSection = document.getElementById('loading-section');
        elements.quizSection = document.getElementById('quiz-section');
        elements.resultSection = document.getElementById('result-section');
        
        elements.displayName = document.getElementById('display-name');
        elements.leaderboardList = document.getElementById('leaderboard');
        elements.personalHistoryList = document.getElementById('personal-history');
        
        elements.qNumber = document.getElementById('q-number');
        elements.progressBar = document.getElementById('progress');
        elements.timer = document.getElementById('timer');
        elements.questionText = document.getElementById('question-text');
        elements.optionsBox = document.getElementById('options-box');
        elements.quizNavigation = document.getElementById('quiz-navigation');
        
        elements.resScore = document.getElementById('res-score');
        elements.resTime = document.getElementById('res-time');
        elements.resAcc = document.getElementById('res-acc');
        elements.reviewAccordion = document.getElementById('review-accordion');

        // STEM elements
        elements.gradeSelect = document.getElementById('grade');
        elements.subjectSelect = document.getElementById('subject');
        elements.topicSelect = document.getElementById('topic');

        // Sidebar drawer elements
        elements.sidebar = document.querySelector('aside');
        elements.sidebarOverlay = document.getElementById('sidebar-overlay');
        elements.mobileMenuBtn = document.getElementById('mobile-menu-btn');

        // Settings Elements
        elements.settingsModal = document.getElementById('settings-modal');
        elements.settingsTheme = document.getElementById('settings-theme');
        elements.settingsBlur = document.getElementById('settings-blur');
        elements.settingsFontScale = document.getElementById('settings-font-scale');
        elements.settingsSound = document.getElementById('settings-sound');
        elements.settingsApiKey = document.getElementById('settings-api-key');

        // Review Modal Elements
        elements.reviewModal = document.getElementById('review-modal');
        elements.reviewModalTitle = document.getElementById('review-modal-title');
        elements.reviewModalContent = document.getElementById('review-modal-content');

        // Scratchpad Elements
        elements.scratchpadToggle = document.getElementById('scratchpad-toggle');
        elements.scratchpadWindow = document.getElementById('scratchpad-window');
        elements.scratchpadCanvas = document.getElementById('scratchpad-canvas');
        elements.scratchpadClear = document.getElementById('scratchpad-clear');
        elements.scratchpadHeader = document.getElementById('scratchpad-header');
        elements.scratchpadResize = document.getElementById('scratchpad-resize');

        // Setup UI Toggles & Drawers
        initSidebarEvents();
        initModalEvents();
        initScratchpad();
        initDraggableScratchpad();
        initCurriculumSelectors();
        applyCustomSettings();
    }

    function initSidebarEvents() {
        if (!elements.mobileMenuBtn) return;
        
        elements.mobileMenuBtn.onclick = () => {
            playSound('click');
            elements.sidebar.classList.add('open');
            elements.sidebarOverlay.classList.add('open');
        };

        elements.sidebarOverlay.onclick = () => {
            elements.sidebar.classList.remove('open');
            elements.sidebarOverlay.classList.remove('open');
        };
    }

    function initModalEvents() {
        // Close modal when clicking backdrop
        document.querySelectorAll('.custom-modal-backdrop').forEach(modal => {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    playSound('click');
                    modal.classList.remove('open');
                }
            };
        });
    }

    // Bind cascading curriculum selectors (Grade & Subject change updates Topics!)
    function initCurriculumSelectors() {
        if (!elements.gradeSelect || !elements.subjectSelect || !elements.topicSelect) return;

        function updateTopics() {
            const grade = elements.gradeSelect.value;
            const subject = elements.subjectSelect.value;
            const map = AIManager.getCurriculumMap();
            
            const topics = map[grade] && map[grade][subject] ? map[grade][subject] : [];
            
            elements.topicSelect.innerHTML = '';
            topics.forEach(topic => {
                const opt = document.createElement('option');
                opt.value = topic;
                opt.innerText = topic;
                elements.topicSelect.appendChild(opt);
            });
        }

        elements.gradeSelect.onchange = () => {
            playSound('click');
            updateTopics();
        };

        elements.subjectSelect.onchange = () => {
            playSound('click');
            updateTopics();
        };

        // Bootstrap initial list
        updateTopics();
    }

    function applyCustomSettings() {
        const settings = StorageManager.getSettings();
        
        // Expose sound setting
        soundEnabled = settings.sound;

        // Apply classes to document element
        const doc = document.documentElement;
        
        // Themes
        doc.className = ''; // Wipe old classes
        doc.classList.add(settings.theme || 'theme-dark');
        
        // Blurs
        doc.classList.add(settings.blur || 'blur-med');
        
        // Font scale
        doc.classList.add(settings.fontScale || 'font-md');

        // Populate values in modal
        if (elements.settingsTheme) elements.settingsTheme.value = settings.theme;
        if (elements.settingsBlur) elements.settingsBlur.value = settings.blur;
        if (elements.settingsFontScale) elements.settingsFontScale.value = settings.fontScale;
        if (elements.settingsSound) elements.settingsSound.checked = settings.sound;
        if (elements.settingsApiKey) elements.settingsApiKey.value = settings.customApiKey || '';
    }

    function openSettings() {
        playSound('click');
        applyCustomSettings();
        elements.settingsModal.classList.add('open');
    }

    function saveSettings() {
        playSound('correct');
        const settings = {
            theme: elements.settingsTheme.value,
            blur: elements.settingsBlur.value,
            fontScale: elements.settingsFontScale.value,
            sound: elements.settingsSound.checked,
            customApiKey: elements.settingsApiKey.value.trim()
        };
        StorageManager.saveSettings(settings);
        applyCustomSettings();
        elements.settingsModal.classList.remove('open');
    }

    function closeSettings() {
        playSound('click');
        elements.settingsModal.classList.remove('open');
    }

    function initScratchpad() {
        if (!elements.scratchpadCanvas) return;
        
        const canvas = elements.scratchpadCanvas;
        canvasCtx = canvas.getContext('2d');

        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            // Preserve sketch data on resize
            const temp = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvasCtx.putImageData(temp, 0, 0);
            
            // Reapply drawing configurations
            canvasCtx.strokeStyle = brushColor;
            canvasCtx.lineWidth = brushWidth;
            canvasCtx.lineCap = 'round';
            canvasCtx.lineJoin = 'round';
        }

        elements.scratchpadToggle.onclick = () => {
            playSound('click');
            elements.scratchpadWindow.classList.toggle('hidden');
            if (!elements.scratchpadWindow.classList.contains('hidden')) {
                resizeCanvas();
            }
        };

        elements.scratchpadClear.onclick = () => {
            playSound('click');
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        };

        // Brush Colors selector
        document.querySelectorAll('.brush-btn').forEach(btn => {
            btn.onclick = () => {
                playSound('click');
                document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                brushColor = btn.dataset.color;
                canvasCtx.strokeStyle = brushColor;
            };
        });

        // Mouse drawing
        canvas.onmousedown = (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
        };

        canvas.onmousemove = (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            canvasCtx.beginPath();
            canvasCtx.moveTo(lastX, lastY);
            canvasCtx.lineTo(x, y);
            canvasCtx.stroke();

            lastX = x;
            lastY = y;
        };

        canvas.onmouseup = () => isDrawing = false;
        canvas.onmouseleave = () => isDrawing = false;

        // Mobile touch support
        canvas.ontouchstart = (e) => {
            if (e.touches.length === 1) {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                lastX = e.touches[0].clientX - rect.left;
                lastY = e.touches[0].clientY - rect.top;
                e.preventDefault();
            }
        };

        canvas.ontouchmove = (e) => {
            if (!isDrawing || e.touches.length !== 1) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;

            canvasCtx.beginPath();
            canvasCtx.moveTo(lastX, lastY);
            canvasCtx.lineTo(x, y);
            canvasCtx.stroke();

            lastX = x;
            lastY = y;
            e.preventDefault();
        };

        canvas.ontouchend = () => isDrawing = false;
    }

    // Draggable & Resizable Handlers for Canvas scratchpad window
    function initDraggableScratchpad() {
        const win = elements.scratchpadWindow;
        const handle = elements.scratchpadHeader;
        const resize = elements.scratchpadResize;
        
        let activeDrag = false;
        let activeResize = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        // DRAG ENGINE
        handle.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            activeDrag = true;
            startLeft = win.offsetLeft;
            startTop = win.offsetTop;
            startX = e.clientX;
            startY = e.clientY;
            win.style.transition = 'none'; // Lock transition on active drag
            e.preventDefault();
        };

        // RESIZE ENGINE
        resize.onmousedown = (e) => {
            activeResize = true;
            startWidth = win.offsetWidth;
            startHeight = win.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;
            win.style.transition = 'none';
            e.preventDefault();
        };

        // GLOBAL MOUSEMOVE AND MOUSEUP
        window.addEventListener('mousemove', (e) => {
            if (activeDrag) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                win.style.left = `${startLeft + dx}px`;
                win.style.top = `${startTop + dy}px`;
                win.style.bottom = 'auto';
                win.style.right = 'auto';
            }
            if (activeResize) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const newWidth = Math.max(260, startWidth + dx);
                const newHeight = Math.max(260, startHeight + dy);
                win.style.width = `${newWidth}px`;
                win.style.height = `${newHeight}px`;
                
                // Trigger canvas redraw
                const canvas = elements.scratchpadCanvas;
                const rect = canvas.getBoundingClientRect();
                const temp = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
                canvas.width = rect.width;
                canvas.height = rect.height;
                canvasCtx.putImageData(temp, 0, 0);
                canvasCtx.strokeStyle = brushColor;
                canvasCtx.lineWidth = brushWidth;
                canvasCtx.lineCap = 'round';
                canvasCtx.lineJoin = 'round';
            }
        });

        window.addEventListener('mouseup', () => {
            if (activeDrag || activeResize) {
                activeDrag = false;
                activeResize = false;
                win.style.transition = '';
            }
        });

        // Touch support for dragging (on Mobile devices)
        handle.ontouchstart = (e) => {
            if (e.target.tagName === 'BUTTON' || e.touches.length !== 1) return;
            activeDrag = true;
            startLeft = win.offsetLeft;
            startTop = win.offsetTop;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            win.style.transition = 'none';
            e.preventDefault();
        };

        handle.ontouchmove = (e) => {
            if (!activeDrag || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            win.style.left = `${startLeft + dx}px`;
            win.style.top = `${startTop + dy}px`;
            win.style.bottom = 'auto';
            win.style.right = 'auto';
            e.preventDefault();
        };

        handle.ontouchend = () => {
            activeDrag = false;
            win.style.transition = '';
        };
    }

    function showSection(sectionName) {
        elements.setupSection.classList.add('hidden');
        elements.loadingSection.classList.add('hidden');
        elements.quizSection.classList.add('hidden');
        elements.resultSection.classList.add('hidden');

        if (sectionName === 'setup') elements.setupSection.classList.remove('hidden');
        else if (sectionName === 'loading') elements.loadingSection.classList.remove('hidden');
        else if (sectionName === 'quiz') elements.quizSection.classList.remove('hidden');
        else if (sectionName === 'result') elements.resultSection.classList.remove('hidden');
    }

    function renderLeaderboard(data) {
        if (!elements.leaderboardList) return;

        if (data.length === 0) {
            elements.leaderboardList.innerHTML = `<div class="text-center py-6 text-slate-500 text-xs italic">Chưa có ai tham gia.</div>`;
            return;
        }

        elements.leaderboardList.innerHTML = data.map((user, index) => {
            let rankClass = "";
            let rankBadge = `#${index + 1}`;
            
            if (index === 0) { rankClass = "rank-1"; rankBadge = "🥇"; }
            else if (index === 1) { rankClass = "rank-2"; rankBadge = "🥈"; }
            else if (index === 2) { rankClass = "rank-3"; rankBadge = "🥉"; }

            return `
                <div class="leaderboard-item">
                    <div class="flex items-center gap-3">
                        <span class="leaderboard-rank ${rankClass}" style="width: 28px; font-weight: 800; display: inline-block;">${rankBadge}</span>
                        <span class="text-xs font-bold text-slate-200">${user.name}</span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-black text-sky-400" style="font-weight: 800; color: #0ea5e9;">${user.score}/10</div>
                        <div class="text-[9px] text-slate-500 font-bold" style="color: #64748b;">${user.time}s</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render personal history items. Clicking opens the detailed full-review modal!
    function renderPersonalHistory(historyList) {
        if (!elements.personalHistoryList) return;

        if (historyList.length === 0) {
            elements.personalHistoryList.innerHTML = `<div class="text-center py-6 text-slate-500 text-xs italic">Chưa thực hiện bài luyện nào.</div>`;
            return;
        }

        elements.personalHistoryList.innerHTML = [...historyList].reverse().slice(0, 5).map(item => `
            <div class="history-item" onclick="UIManager.openHistoryReview('${item.id}')">
                <div style="display: flex; flex-direction: column; gap: 2px; max-width: 140px;">
                    <span class="font-bold text-slate-300 truncate">${item.subject || 'Toán học'} ${item.grade || '11'}</span>
                    <span class="text-[10px] text-slate-400 truncate font-semibold" style="font-size: 11px;">${item.topic}</span>
                    <span class="text-[9px] text-slate-500">${new Date(item.timestamp).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="text-right" style="display: flex; flex-direction: column; justify-content: center;">
                    <span class="font-black text-sky-400" style="font-size: 13px;">${item.score}/${item.total}</span>
                    <p class="text-[8px] font-bold text-emerald-400">${Math.round((item.score/item.total)*100)}%</p>
                </div>
            </div>
        `).join('');
    }

    // Opens a full history review modal with colorblind-friendly tick/crosses!
    function openHistoryReview(id) {
        const history = StorageManager.getPersonalHistory();
        const record = history.find(item => item.id === id);
        if (!record) return;

        playSound('click');
        elements.reviewModalTitle.innerText = `${record.subject || 'Toán học'} Lớp ${record.grade || '11'} - ${record.topic}`;
        
        elements.reviewModalContent.innerHTML = record.quizData.map((item, idx) => {
            const userAnsIdx = record.userAnswers[idx];
            const isCorrect = userAnsIdx === item.c;

            return `
                <div class="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                        <span class="px-2.5 py-1 text-[10px] font-black rounded-lg ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                            CÂU ${idx + 1} - ${isCorrect ? 'ĐÚNG ✔️' : 'SAI ❌'}
                        </span>
                        <span class="text-xs text-slate-500 font-medium">Bấm để xem đáp án</span>
                    </div>
                    <p class="font-bold text-slate-200 leading-relaxed">${item.q}</p>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                        ${item.a.map((ans, aIdx) => {
                            let optionStyle = 'border: 1px solid rgba(255,255,255,0.05); background: transparent;';
                            let symbol = '';

                            if (aIdx === item.c) {
                                // Correct choice highlight
                                optionStyle = 'border: 1px solid rgba(16, 185, 129, 0.4) !important; background: rgba(16, 185, 129, 0.08) !important;';
                                symbol = '<span style="color: #10b981; font-weight: 900; margin-left: 8px;">✔️ (Đáp án đúng)</span>';
                            }
                            if (aIdx === userAnsIdx && aIdx !== item.c) {
                                // User chose incorrect option
                                optionStyle = 'border: 1px solid rgba(244, 63, 94, 0.4) !important; background: rgba(244, 63, 94, 0.08) !important;';
                                symbol = '<span style="color: #f43f5e; font-weight: 900; margin-left: 8px;">❌ (Bạn chọn)</span>';
                            } else if (aIdx === userAnsIdx && aIdx === item.c) {
                                symbol = '<span style="color: #10b981; font-weight: 900; margin-left: 8px;">✔️ (Bạn chọn đúng)</span>';
                            }

                            return `
                                <div style="padding: 10px 14px; border-radius: 12px; font-size: 13px; display: flex; justify-content: space-between; align-items: center; ${optionStyle}">
                                    <div><strong>${String.fromCharCode(65 + aIdx)}.</strong> ${ans}</div>
                                    <div>${symbol}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="review-explanation">
                        <strong>💡 HƯỚNG DẪN GIẢI CHI TIẾT:</strong><br>
                        ${item.explain || "Không có giải thích cụ thể cho câu này."}
                    </div>
                </div>
            `;
        }).join('<div style="height: 16px;"></div>');

        // Reveal modal
        elements.reviewModal.classList.add('open');

        // Auto render equations inside history modal
        renderMathInElement(elements.reviewModalContent, { 
            delimiters: [{left: '$', right: '$', display: false}] 
        });
    }

    function updateProfile(name) {
        if (elements.displayName) {
            elements.displayName.innerText = name;
        }
    }

    function updateTimer(seconds) {
        if (!elements.timer) return;
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        elements.timer.innerText = `${m}:${s}`;
    }

    function renderNavigation(total, activeIdx, userAnswers, onJump) {
        if (!elements.quizNavigation) return;
        
        elements.quizNavigation.innerHTML = '';
        
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = `nav-dot ${i === activeIdx ? 'active' : ''} ${userAnswers[i] !== null ? 'answered' : ''}`;
            dot.innerText = i + 1;
            dot.onclick = () => {
                playSound('click');
                onJump(i);
            };
            elements.quizNavigation.appendChild(dot);
        }
    }

    function renderQuestion(questionObj, index, total, userAnswers, onAnswerSelect) {
        elements.qNumber.innerText = `CÂU ${String(index + 1).padStart(2, '0')}`;
        
        const answeredCount = userAnswers.filter(ans => ans !== null).length;
        elements.progressBar.style.width = `${(answeredCount / total) * 100}%`;
        
        elements.questionText.innerHTML = questionObj.q;
        elements.optionsBox.innerHTML = '';
        
        const selectedChoiceIdx = userAnswers[index];
        
        questionObj.a.forEach((opt, i) => {
            const div = document.createElement('div');
            div.className = `option-item ${selectedChoiceIdx === i ? 'selected' : ''}`;
            div.innerHTML = `
                <div class="option-badge">
                    ${String.fromCharCode(65 + i)}
                </div>
                <div style="flex: 1; font-weight: 600; font-size: 14px; color: #e2e8f0;">${opt}</div>
            `;
            
            div.onclick = () => {
                playSound('click');
                const items = elements.optionsBox.querySelectorAll('.option-item');
                items.forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                
                onAnswerSelect(i);
            };
            
            elements.optionsBox.appendChild(div);
        });

        renderMathInElement(document.body, { 
            delimiters: [{left: '$', right: '$', display: false}] 
        });
    }

    function renderResults(score, total, time, quizData, userAnswers) {
        playSound('success');
        elements.resScore.innerText = `${score}/${total}`;
        elements.resTime.innerText = `${time}s`;
        
        const accuracy = Math.round((score / total) * 100);
        elements.resAcc.innerText = `${accuracy}%`;

        if (score >= 8 && typeof confetti !== 'undefined') {
            triggerConfetti();
        }

        // Render explanation review accordion
        elements.reviewAccordion.innerHTML = quizData.map((item, idx) => {
            const userAnsIdx = userAnswers[idx];
            const isCorrect = userAnsIdx === item.c;

            return `
                <div class="review-item" id="review-item-${idx}">
                    <div class="review-header" onclick="UIManager.toggleAccordion(${idx})">
                        <span>Câu ${idx + 1}: ${isCorrect ? '✔️ Đúng' : '❌ Sai'}</span>
                        <span class="text-sky-400 font-bold" style="font-size: 13px;">Chi tiết Lời Giải 📂</span>
                    </div>
                    <div class="review-body">
                        <p style="font-weight: 700; margin-bottom: 8px;">Đề bài: <span style="font-weight: 500;">${item.q}</span></p>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px; font-size: 13px;">
                            ${item.a.map((ans, aIdx) => {
                                let itemStyle = 'border: 1px solid rgba(255,255,255,0.05); background: transparent;';
                                let symbol = '';
                                if (aIdx === item.c) {
                                    itemStyle = 'border: 1px solid rgba(16, 185, 129, 0.3) !important; background: rgba(16, 185, 129, 0.08) !important;';
                                    symbol = '<span style="color: #10b981; font-weight: 900; margin-left: 8px;">✔️ (Đáp án đúng)</span>';
                                }
                                if (aIdx === userAnsIdx && aIdx !== item.c) {
                                    itemStyle = 'border: 1px solid rgba(244, 63, 94, 0.3) !important; background: rgba(244, 63, 94, 0.08) !important;';
                                    symbol = '<span style="color: #f43f5e; font-weight: 900; margin-left: 8px;">❌ (Bạn chọn)</span>';
                                }
                                return `
                                    <div style="padding: 8px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; ${itemStyle}">
                                        <div><strong>${String.fromCharCode(65 + aIdx)}.</strong> ${ans}</div>
                                        <div>${symbol}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="review-explanation">
                            <strong>💡 HƯỚNG DẪN GIẢI CHI TIẾT:</strong><br>
                            ${item.explain || "Không có giải thích cụ thể cho câu này."}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        renderMathInElement(elements.reviewAccordion, { 
            delimiters: [{left: '$', right: '$', display: false}] 
        });
    }

    function toggleAccordion(idx) {
        playSound('click');
        const item = document.getElementById(`review-item-${idx}`);
        if (item) {
            item.classList.toggle('active');
        }
    }

    function triggerConfetti() {
        const duration = 3.5 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#38bdf8', '#6366f1', '#10b981']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#38bdf8', '#6366f1', '#10b981']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    return {
        init,
        showSection,
        renderLeaderboard,
        renderPersonalHistory,
        openHistoryReview,
        updateProfile,
        updateTimer,
        renderNavigation,
        renderQuestion,
        renderResults,
        toggleAccordion,
        openSettings,
        saveSettings,
        closeSettings,
        playSound
    };
})();
