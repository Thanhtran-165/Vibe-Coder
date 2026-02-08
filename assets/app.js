// ========================================
// APP STATE
// ========================================
const AppState = {
    content: null,
    currentTheme: localStorage.getItem('theme') || 'light',
    quizAnswers: {},
    quizScore: 0
};

// ========================================
// CONTENT LOADING
// ========================================
async function loadContent() {
    try {
        const response = await fetch('assets/content.json');
        AppState.content = await response.json();
        initializeApp();
    } catch (error) {
        console.error('Failed to load content:', error);
        showError('Không thể tải nội dung. Vui lòng tải lại trang.');
    }
}

function initializeApp() {
    renderStats();
    renderCharacteristics();
    renderMisconceptions();
    renderUserTypesChart();
    renderLevels();
    renderQuiz();
    renderTakeaways();
    renderReferences();
    initializeTheme();
    initializeNavigation();
    initializeScrollSpy();
    initializeReadingProgress();
    initializeRevealAnimations();
}

// ========================================
// THEME MANAGEMENT
// ========================================
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', AppState.currentTheme);

    themeToggle.addEventListener('click', () => {
        AppState.currentTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', AppState.currentTheme);
        localStorage.setItem('theme', AppState.currentTheme);
    });
}

// ========================================
// NAVIGATION & SCROLL SPY
// ========================================
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeScrollSpy() {
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// ========================================
// READING PROGRESS
// ========================================
function initializeReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    });
}

// ========================================
// REVEAL ANIMATIONS
// ========================================
function initializeRevealAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible', 'fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe level items for accordion animation
    document.querySelectorAll('.level-item').forEach(item => {
        observer.observe(item);
    });

    // Observe cards
    document.querySelectorAll('.card, .stat-card, .misconception-card, .takeaway-item').forEach(item => {
        item.style.opacity = '0';
        observer.observe(item);
    });
}

// ========================================
// RENDER FUNCTIONS
// ========================================

// Stats Section
function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid || !AppState.content?.stats) return;

    statsGrid.innerHTML = AppState.content.stats.map(stat => `
        <div class="stat-card">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
            <div class="stat-source">${stat.source}</div>
        </div>
    `).join('');
}

// Vibe Coder Characteristics
function renderCharacteristics() {
    const grid = document.getElementById('characteristicsGrid');
    if (!grid || !AppState.content?.vibeCoder?.characteristics) return;

    grid.innerHTML = AppState.content.vibeCoder.characteristics.map(char => `
        <div class="card">
            <div class="card-icon">${char.icon}</div>
            <h3 class="card-title">
                ${char.title}
                <span class="card-title-en">${char.en}</span>
            </h3>
            <p class="card-description">${char.description}</p>
        </div>
    `).join('');
}

// Misconceptions
function renderMisconceptions() {
    const grid = document.getElementById('misconceptionsGrid');
    if (!grid || !AppState.content?.misconceptions) return;

    grid.innerHTML = AppState.content.misconceptions.map(mis => `
        <div class="misconception-card">
            <h3>${mis.title}</h3>
            <p>${mis.description}</p>
            <strong>So What?</strong>
            <p>${mis.soWhat}</p>
        </div>
    `).join('');
}

// User Types Chart
function renderUserTypesChart() {
    const chart = document.getElementById('scatterChart');
    const legend = document.getElementById('userTypesLegend');
    if (!chart || !legend || !AppState.content?.userTypes) return;

    const chartWidth = chart.offsetWidth || 600;
    const chartHeight = 400;
    const padding = 50;

    // Render chart points
    chart.innerHTML = AppState.content.userTypes.map(type => {
        const x = padding + (type.agency / 100) * (chartWidth - 2 * padding) - 30;
        const y = chartHeight - padding - (type.literacy / 100) * (chartHeight - 2 * padding) - 30;

        return `
            <div class="chart-point" style="left: ${x}px; top: ${y}px; background-color: ${type.color};">
                ${type.id === 'vibe-coder' ? 'L0-L2' :
                  type.id === 'autopilot' ? 'L2-L3' :
                  type.id === 'workflow-builder' ? 'L4' : 'L5-L6'}
                <div class="chart-point-tooltip">
                    <div class="tooltip-title">${type.name}</div>
                    <div class="tooltip-desc">${type.description}</div>
                    <div style="margin-top: 8px; font-size: 11px; color: #666;">
                        <strong>Triết lý:</strong> ${type.philosophy}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Render legend
    legend.innerHTML = AppState.content.userTypes.map(type => `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${type.color};"></div>
            <span><strong>${type.name}</strong>: ${type.en}</span>
        </div>
    `).join('');
}

// Levels Timeline
function renderLevels() {
    const timeline = document.getElementById('timelineLevels');
    if (!timeline || !AppState.content?.levels) return;

    timeline.innerHTML = AppState.content.levels.map(level => `
        <div class="level-item" data-level="${level.level}">
            <div class="level-marker" style="border-color: ${level.color}; color: ${level.color};">
                ${level.level.replace('L', '')}
            </div>
            <div class="level-header" onclick="toggleLevel(this)">
                <div>
                    <span class="level-badge" style="background-color: ${level.color};">${level.level}</span>
                    <span class="level-name">${level.name}</span>
                    <span class="level-name-vn">${level.vn}</span>
                </div>
                <div class="level-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </div>
            </div>
            <div class="level-content">
                <div class="level-details">
                    <p class="level-description">${level.description}</p>

                    ${level.signs ? `
                        <div class="level-signs">
                            <h4>Dấu hiệu nhận biết:</h4>
                            <ul>
                                ${level.signs.map(sign => `<li>${sign}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="level-next-step">
                        <strong>→ Bước tiếp theo:</strong> ${level.nextStep}
                    </div>

                    ${level.warning ? `
                        <div class="level-warning">
                            <strong>⚠️ Lưu ý:</strong> ${level.warning}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function toggleLevel(header) {
    const levelItem = header.closest('.level-item');
    levelItem.classList.toggle('expanded');
}

// Quiz
function renderQuiz() {
    const startBtn = document.getElementById('startQuizBtn');
    const questionsContainer = document.getElementById('quizQuestions');

    if (!startBtn || !questionsContainer || !AppState.content?.quiz) return;

    startBtn.addEventListener('click', () => {
        document.querySelector('.quiz-intro').style.display = 'none';
        questionsContainer.style.display = 'block';
        renderQuizQuestions();
    });
}

function renderQuizQuestions() {
    const container = document.getElementById('quizQuestions');
    if (!container || !AppState.content?.quiz?.questions) return;

    container.innerHTML = AppState.content.quiz.questions.map((q, index) => `
        <div class="quiz-question" data-question="${q.id}">
            <h3>Câu ${index + 1}: ${q.text}</h3>
            <p class="quiz-question-detail">${q.detail}</p>
            <div class="quiz-options">
                ${Object.entries(q.scoring).map(([score, description]) => `
                    <label class="quiz-option">
                        <input type="radio" name="${q.id}" value="${score}" onchange="selectQuizOption('${q.id}', ${score})">
                        <div class="quiz-option-label">${description}</div>
                        <div class="quiz-option-score">${score} điểm</div>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <div class="quiz-actions">
            <button class="btn btn-primary btn-large" onclick="calculateQuizResult()">Xem kết quả</button>
            <button class="btn btn-secondary" onclick="resetQuiz()">Làm lại</button>
        </div>
    `;
}

function selectQuizOption(questionId, score) {
    AppState.quizAnswers[questionId] = score;

    // Update visual selection
    const questionContainer = document.querySelector(`[data-question="${questionId}"]`);
    questionContainer.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.quiz-option').classList.add('selected');
}

function calculateQuizResult() {
    const totalQuestions = AppState.content.quiz.questions.length;
    const answeredQuestions = Object.keys(AppState.quizAnswers).length;

    if (answeredQuestions < totalQuestions) {
        alert('Vui lòng trả lời tất cả các câu hỏi!');
        return;
    }

    // Calculate total score
    const totalScore = Object.values(AppState.quizAnswers).reduce((sum, val) => sum + val, 0);
    AppState.quizScore = totalScore;

    // Determine level
    let level = '';
    if (totalScore <= 1) level = 'L0-L1';
    else if (totalScore === 2) level = 'L2';
    else if (totalScore === 3) level = 'L3';
    else if (totalScore === 4) level = 'L4';
    else if (totalScore === 5) level = 'L5';
    else level = 'L6';

    // Determine persona
    const agencyProxy = (AppState.quizAnswers['q1'] || 0) + (AppState.quizAnswers['q2'] || 0);
    const literacyProxy = (AppState.quizAnswers['q2'] || 0) + (AppState.quizAnswers['q3'] || 0);

    let personaKey = '';
    if (agencyProxy <= 2 && literacyProxy <= 2) {
        personaKey = 'low_low';
    } else if (agencyProxy <= 2 && literacyProxy > 2) {
        personaKey = 'low_high';
    } else if (agencyProxy > 2 && literacyProxy <= 3) {
        personaKey = 'medium_high';
    } else {
        personaKey = 'high_high';
    }

    const persona = AppState.content.quiz.personaMapping[personaKey];

    // Show result
    showQuizResult(totalScore, level, persona);
}

function showQuizResult(score, level, persona) {
    const resultContainer = document.getElementById('quizResult');
    const questionsContainer = document.getElementById('quizQuestions');

    if (!resultContainer || !questionsContainer) return;

    questionsContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    resultContainer.innerHTML = `
        <div class="result-header">
            <div class="result-level">${level}</div>
            <div class="result-persona">${persona.name}</div>
            <div class="result-score">Tổng điểm: ${score}/6</div>
        </div>

        <div class="result-details">
            <div class="result-explanation">
                <h4>Giải thích</h4>
                <p><strong>Điểm số của bạn:</strong> ${score}/6 điểm</p>
                <p><strong>Level:</strong> ${level} - ${
                    level === 'L0-L1' ? 'Người tiêu thụ / Vận hành prompt cơ bản' :
                    level === 'L2' ? 'Vibe Coder - Lập trình cảm tính' :
                    level === 'L3' ? 'Người xây dựng có hỗ trợ' :
                    level === 'L4' ? 'Nhà thiết kế quy trình chủ động' :
                    level === 'L5' ? 'Người vận hành hệ thống' :
                    'Kiến trúc sư hệ thống AI'
                }</p>
                <p><strong>Persona:</strong> ${persona.name} (${persona.condition})</p>
            </div>

            <div class="result-upgrade">
                <h4>3 bước nâng cấp tiếp theo</h4>
                <ol>
                    ${persona.upgrade.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        </div>

        <div class="result-actions">
            <button class="btn btn-primary" onclick="copyQuizResult()">Copy kết quả</button>
            <button class="btn btn-secondary" onclick="resetQuiz()">Làm lại</button>
        </div>
    `;
}

function resetQuiz() {
    AppState.quizAnswers = {};
    AppState.quizScore = 0;

    document.querySelectorAll('.quiz-option input[type="radio"]').forEach(input => {
        input.checked = false;
    });

    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });

    document.getElementById('quizResult').style.display = 'none';
    document.querySelector('.quiz-intro').style.display = 'block';
    document.getElementById('quizQuestions').style.display = 'none';
}

function copyQuizResult() {
    const score = AppState.quizScore;
    const levelText = document.querySelector('.result-level').textContent;
    const personaText = document.querySelector('.result-persona').textContent;
    const upgradeSteps = document.querySelectorAll('.result-upgrade li');

    const resultText = `
📊 Kết quả đánh giá năng lực làm việc với AI

Level: ${levelText}
Persona: ${personaText}
Tổng điểm: ${score}/6

3 bước nâng cấp tiếp theo:
${Array.from(upgradeSteps).map((step, i) => `${i + 1}. ${step.textContent}`).join('\n')}

---
Nguồn: Từ "Vibe Coder" đến Kiến trúc sư AI
    `.trim();

    navigator.clipboard.writeText(resultText).then(() => {
        const copyBtn = document.querySelector('.copy-result-btn');
        if (copyBtn) {
            copyBtn.textContent = 'Đã copy!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy kết quả';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Không thể copy kết quả. Vui lòng thử lại.');
    });
}

// Takeaways
function renderTakeaways() {
    const container = document.getElementById('takeaways');
    if (!container || !AppState.content?.conclusion?.takeaways) return;

    container.innerHTML = AppState.content.conclusion.takeaways.map(takeaway => `
        <div class="takeaway-item">
            <p>${takeaway}</p>
        </div>
    `).join('');
}

// References
function renderReferences() {
    const container = document.getElementById('referencesList');
    if (!container || !AppState.content?.references) return;

    container.innerHTML = AppState.content.references.map(ref => `
        <div class="reference-item">
            <a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.title}</a>
            <div class="reference-source">${ref.source}</div>
        </div>
    `).join('');
}

// ========================================
// ERROR HANDLING
// ========================================
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fee;
        border: 1px solid #f88;
        color: #c33;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

// ========================================
// INITIALIZE APP
// ========================================
document.addEventListener('DOMContentLoaded', loadContent);

// ========================================
// KEYBOARD NAVIGATION
// ========================================
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
});