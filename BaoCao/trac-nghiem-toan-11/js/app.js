/**
 * app.js - Central Application Controller
 */

const App = (() => {
    let quizData = [];
    let currentIdx = 0;
    let score = 0;
    let timer = 0;
    let timerInterval = null;
    let userName = "";
    let userAnswers = []; // Holds index of selected choices [null, 2, 0, null, ...]
    let activeTopic = "";
    let activeGrade = "11";
    let activeSubject = "Toán học";

    async function init() {
        // Initialize storage & UI modules
        StorageManager.init();
        UIManager.init();

        // Autoload saved username
        const savedName = StorageManager.getUsername();
        if (savedName) {
            const input = document.getElementById('username');
            if (input) input.value = savedName;
            UIManager.updateProfile(savedName);
        }

        // Render Sidebar Leaderboard & Personal History
        await reloadLeaderboard();
        reloadPersonalHistory();

        // Check for active quiz recovery cache
        checkQuizRecovery();
    }

    async function reloadLeaderboard() {
        const board = await StorageManager.getLeaderboard();
        UIManager.renderLeaderboard(board);
    }

    function reloadPersonalHistory() {
        const history = StorageManager.getPersonalHistory();
        UIManager.renderPersonalHistory(history);
    }

    // Cache state in sessionStorage mid-quiz
    function saveQuizCache() {
        try {
            const state = {
                quizData,
                currentIdx,
                timer,
                userAnswers,
                activeTopic,
                activeGrade,
                activeSubject,
                userName
            };
            sessionStorage.setItem('toan11_active_quiz', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save quiz cache:", e);
        }
    }

    function clearQuizCache() {
        try {
            sessionStorage.removeItem('toan11_active_quiz');
        } catch (e) {}
    }

    function checkQuizRecovery() {
        try {
            const cached = sessionStorage.getItem('toan11_active_quiz');
            if (cached) {
                const state = JSON.parse(cached);
                if (state && state.quizData && state.quizData.length > 0) {
                    const confirmResume = confirm(`Bạn có bài làm dở môn "${state.activeSubject || 'Toán học'}" Lớp ${state.activeGrade || '11'} chưa hoàn thành. Bạn có muốn tiếp tục làm tiếp không?`);
                    if (confirmResume) {
                        // Restore state
                        quizData = state.quizData;
                        currentIdx = state.currentIdx;
                        timer = state.timer;
                        userAnswers = state.userAnswers;
                        activeTopic = state.activeTopic;
                        activeGrade = state.activeGrade || "11";
                        activeSubject = state.activeSubject || "Toán học";
                        userName = state.userName;

                        UIManager.updateProfile(userName);
                        UIManager.showSection('quiz');
                        UIManager.updateTimer(timer);

                        // Resume clock
                        if (timerInterval) clearInterval(timerInterval);
                        timerInterval = setInterval(() => {
                            timer++;
                            UIManager.updateTimer(timer);
                            saveQuizCache(); // Update clock in cache
                        }, 1000);

                        showQuestion();
                        return;
                    } else {
                        clearQuizCache();
                    }
                }
            }
        } catch (e) {
            console.error("Quiz recovery failed:", e);
        }
    }

    async function startGeneration() {
        UIManager.playSound('click');
        userName = document.getElementById('username').value.trim() || "Học sinh ẩn danh";
        activeGrade = document.getElementById('grade').value;
        activeSubject = document.getElementById('subject').value;
        activeTopic = document.getElementById('topic').value;

        // Persist username profile
        StorageManager.setUsername(userName);
        UIManager.updateProfile(userName);
        UIManager.showSection('loading');

        try {
            quizData = await AIManager.generateQuiz(activeGrade, activeSubject, activeTopic, "Cơ bản");
            initQuiz();
        } catch (err) {
            console.error("Critical Quiz Generation Error:", err);
            alert("Lỗi kết nối AI hoặc phân tích dữ liệu. Đang tải dữ liệu luyện tập mặc định.");
            quizData = await AIManager.generateQuiz(activeGrade, activeSubject, activeTopic, "Cơ bản");
            initQuiz();
        }
    }

    function initQuiz() {
        currentIdx = 0;
        score = 0;
        timer = 0;
        userAnswers = Array(quizData.length).fill(null);
        
        UIManager.showSection('quiz');
        UIManager.updateTimer(timer);

        // Cache initial state
        saveQuizCache();

        // Start clock
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer++;
            UIManager.updateTimer(timer);
            saveQuizCache(); // Sync cache
        }, 1000);

        showQuestion();
    }

    function showQuestion() {
        const currentQuestionObj = quizData[currentIdx];
        
        // Navigation updates
        UIManager.renderNavigation(quizData.length, currentIdx, userAnswers, jumpToQuestion);
        
        // Question details
        UIManager.renderQuestion(
            currentQuestionObj, 
            currentIdx, 
            quizData.length, 
            userAnswers,
            handleAnswer
        );
        saveQuizCache();
    }

    function handleAnswer(choiceIdx) {
        userAnswers[currentIdx] = choiceIdx;
        UIManager.renderNavigation(quizData.length, currentIdx, userAnswers, jumpToQuestion);
        saveQuizCache();
    }

    function jumpToQuestion(idx) {
        if (idx >= 0 && idx < quizData.length) {
            currentIdx = idx;
            showQuestion();
        }
    }

    function nextQuestion() {
        UIManager.playSound('click');
        if (currentIdx < quizData.length - 1) {
            jumpToQuestion(currentIdx + 1);
        }
    }

    function prevQuestion() {
        UIManager.playSound('click');
        if (currentIdx > 0) {
            jumpToQuestion(currentIdx - 1);
        }
    }

    async function finishQuiz() {
        UIManager.playSound('click');
        const unansweredCount = userAnswers.filter(ans => ans === null).length;
        if (unansweredCount > 0) {
            const confirmSubmit = confirm(`Bạn còn ${unansweredCount} câu chưa làm. Bạn có chắc chắn muốn nộp bài?`);
            if (!confirmSubmit) return;
        }

        clearInterval(timerInterval);
        clearQuizCache(); // Wipe session cache on clean finish!
        UIManager.showSection('loading');

        // Evaluate actual score
        score = 0;
        userAnswers.forEach((ansIdx, qIdx) => {
            if (ansIdx !== null && ansIdx === quizData[qIdx].c) {
                score++;
            }
        });

        // Save verified score to Database
        await StorageManager.saveScore(userName, score, timer);

        // Save complete history set (with questions & answers)
        StorageManager.savePersonalHistory(activeTopic, score, quizData.length, timer, quizData, userAnswers, activeGrade, activeSubject);

        // Refresh lists
        await reloadLeaderboard();
        reloadPersonalHistory();

        // Render Results
        UIManager.renderResults(score, quizData.length, timer, quizData, userAnswers);
        UIManager.showSection('result');
    }

    return {
        init,
        startGeneration,
        reloadLeaderboard,
        jumpToQuestion,
        nextQuestion,
        prevQuestion,
        finishQuiz
    };
})();

// Boot
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
