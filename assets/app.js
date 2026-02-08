// ========================================
// APP STATE
// ========================================
const AppState = {
    content: null,
    currentTheme: localStorage.getItem('theme') || 'light',
    quizAnswers: {},
    quizScore: 0,
    userTypesGlobalListenersInitialized: false,
    chartResizeHandlerInitialized: false,
    chartResizeTimeout: null
};

function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
    setCurrentYear();
    renderStats();
    renderCharacteristics();
    renderMisconceptions();
    renderUserTypesChart();
    initializeChartResizeHandler();
    renderLevels();
    renderQuiz();
    renderTakeaways();
    renderReferences();
    initializeTheme();
    initializeNavigation();
    initializeScrollSpy();
    initializeReadingProgress();
    initializeRevealAnimations();
    initializeTemplateCopyButtons();
}

function setCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initializeChartResizeHandler() {
    if (AppState.chartResizeHandlerInitialized) return;
    AppState.chartResizeHandlerInitialized = true;

    window.addEventListener('resize', () => {
        window.clearTimeout(AppState.chartResizeTimeout);
        AppState.chartResizeTimeout = window.setTimeout(() => {
            renderUserTypesChart();
        }, 150);
    });
}

// ========================================
// THEME MANAGEMENT
// ========================================
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    };

    // Apply saved theme
    applyTheme(AppState.currentTheme);

    themeToggle.addEventListener('click', () => {
        AppState.currentTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(AppState.currentTheme);
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
            navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active') ? 'true' : 'false');
        });

        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                const instant = prefersReducedMotion() || this.classList.contains('skip-link');
                window.scrollTo({
                    top: targetPosition,
                    behavior: instant ? 'auto' : 'smooth'
                });

                // Ensure keyboard users land on the target
                if (!target.hasAttribute('tabindex')) {
                    target.setAttribute('tabindex', '-1');
                    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
                }
                window.setTimeout(() => target.focus({ preventScroll: true }), instant ? 0 : 450);
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
                const activeLink = Array.from(navLinks).find(link => link.getAttribute('href') === `#${id}`);
                if (!activeLink) return;

                navLinks.forEach(link => link.classList.remove('active'));
                activeLink.classList.add('active');
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
    const revealTargets = document.querySelectorAll(
        '.level-item, .card, .stat-card, .insight-card, .misconception-card, .so-what, .chart-container, .toolkit-card, .takeaway-item, .quiz-container, .conclusion-cta, .reference-item'
    );

    if (!revealTargets.length) return;

    if (prefersReducedMotion()) {
        revealTargets.forEach(el => el.classList.add('visible'));
        return;
    }

    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('stat-card')) {
                animateStatCard(entry.target);
            }
            observer.unobserve(entry.target);
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12
    });

    revealTargets.forEach((el, index) => {
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', `${Math.min(index * 50, 250)}ms`);
        observer.observe(el);
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

function parseStatValue(raw) {
    const trimmed = (raw || '').trim();
    const match = trimmed.match(/^(\$)?(\d+(?:\.\d+)?)([a-zA-Z%]*)$/);
    if (!match) return null;

    const [, prefix = '', numberPart, suffix = ''] = match;
    const value = Number(numberPart);
    if (!Number.isFinite(value)) return null;

    const decimals = numberPart.includes('.') ? numberPart.split('.')[1].length : 0;
    return { prefix, value, suffix, decimals, raw: trimmed };
}

function animateStatCard(card) {
    const valueEl = card.querySelector('.stat-value');
    if (!valueEl) return;
    if (valueEl.dataset.animated === 'true') return;

    const parsed = parseStatValue(valueEl.textContent);
    if (!parsed) return;

    valueEl.dataset.animated = 'true';

    const { prefix, value, suffix, decimals, raw } = parsed;
    const durationMs = 900;
    const start = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const frame = (now) => {
        const t = Math.min((now - start) / durationMs, 1);
        const eased = easeOutCubic(t);
        const current = value * eased;
        const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
        valueEl.textContent = `${prefix}${formatted}${suffix}`;

        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            valueEl.textContent = raw;
        }
    };

    valueEl.textContent = `${prefix}${decimals > 0 ? (0).toFixed(decimals) : '0'}${suffix}`;
    requestAnimationFrame(frame);
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

        const levelRange = type.id === 'vibe-coder' ? 'L0-L2' :
            type.id === 'autopilot' ? 'L2-L3' :
            type.id === 'workflow-builder' ? 'L4' : 'L5-L6';

        return `
            <div
                class="chart-point"
                data-user-type="${type.id}"
                role="button"
                tabindex="0"
                aria-expanded="false"
                aria-label="${type.name} (nhấn để xem mô tả)"
                style="left: ${x}px; top: ${y}px; background-color: ${type.color};"
            >
                ${levelRange}
                <div class="chart-point-tooltip" role="tooltip">
                    <div class="tooltip-title">${type.name}</div>
                    <div class="tooltip-desc">${type.description}</div>
                    <div class="tooltip-meta"><strong>Triết lý:</strong> ${type.philosophy}</div>
                    ${type.risk ? `<div class="tooltip-meta"><strong>Rủi ro:</strong> ${type.risk}</div>` : ''}
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

    initializeUserTypesInteractions();
}

function closeAllUserTypeTooltips() {
    document.querySelectorAll('.chart-point.is-open').forEach(point => {
        point.classList.remove('is-open');
        point.setAttribute('aria-expanded', 'false');
    });
}

function initializeUserTypesInteractions() {
    const points = document.querySelectorAll('.chart-point');
    if (!points.length) return;

    points.forEach(point => {
        point.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasOpen = point.classList.contains('is-open');
            closeAllUserTypeTooltips();
            if (!wasOpen) {
                point.classList.add('is-open');
                point.setAttribute('aria-expanded', 'true');
            }
        });

        point.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                point.click();
                return;
            }
            if (e.key === 'Escape') {
                closeAllUserTypeTooltips();
                point.blur();
            }
        });
    });

    if (AppState.userTypesGlobalListenersInitialized) return;
    document.addEventListener('click', closeAllUserTypeTooltips);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllUserTypeTooltips();
    });
    AppState.userTypesGlobalListenersInitialized = true;
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
            <button
                class="level-header"
                id="level-header-${level.level}"
                type="button"
                onclick="toggleLevel(this)"
                aria-expanded="false"
                aria-controls="level-content-${level.level}"
            >
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
            </button>
            <div class="level-content" id="level-content-${level.level}" role="region" aria-labelledby="level-header-${level.level}">
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

function toggleLevel(button) {
    const levelItem = button.closest('.level-item');
    if (!levelItem) return;

    const content = levelItem.querySelector('.level-content');
    const isExpanded = levelItem.classList.toggle('expanded');
    button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

    if (content) {
        content.style.maxHeight = isExpanded ? `${content.scrollHeight}px` : '0px';
    }
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
                        <input type="radio" name="${q.id}" value="${score}" onchange="selectQuizOption(event, '${q.id}', ${score})">
                        <div class="quiz-option-label">${description}</div>
                        <div class="quiz-option-score">${score} điểm</div>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <div class="quiz-actions">
            <button class="btn btn-primary btn-large" type="button" onclick="calculateQuizResult()">Xem kết quả</button>
            <button class="btn btn-secondary" type="button" onclick="resetQuiz()">Làm lại</button>
        </div>
    `;
}

function selectQuizOption(event, questionId, score) {
    AppState.quizAnswers[questionId] = score;

    // Update visual selection
    const questionContainer = document.querySelector(`[data-question="${questionId}"]`);
    if (!questionContainer) return;

    questionContainer.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = event?.target?.closest('.quiz-option');
    if (selectedOption) selectedOption.classList.add('selected');
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
            <button class="btn btn-primary copy-btn" type="button" onclick="copyQuizResult()">Copy kết quả</button>
            <button class="btn btn-secondary" type="button" onclick="resetQuiz()">Làm lại</button>
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

async function copyToClipboard(text) {
    const value = (text || '').toString();
    if (!value) return false;

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return true;
        }
    } catch (_) {
        // Fallback below
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        textarea.remove();
        return ok;
    } catch (_) {
        return false;
    }
}

function flashCopied(button, { copiedText = 'Đã copy!', durationMs = 1500 } = {}) {
    if (!button) return;

    const original = button.getAttribute('data-original-label') || button.textContent;
    button.setAttribute('data-original-label', original);
    button.textContent = copiedText;
    button.classList.add('copied');

    window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove('copied');
    }, durationMs);
}

function initializeTemplateCopyButtons() {
    document.querySelectorAll('.copy-template-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-copy-target');
            const source = targetId ? document.getElementById(targetId) : null;
            const text = source?.textContent?.trim();
            if (!text) return;

            const ok = await copyToClipboard(text);
            if (ok) {
                flashCopied(btn);
            } else {
                alert('Không thể copy template. Vui lòng thử lại.');
            }
        });
    });
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

    copyToClipboard(resultText).then((ok) => {
        if (!ok) {
            alert('Không thể copy kết quả. Vui lòng thử lại.');
            return;
        }
        flashCopied(document.querySelector('#quizResult .copy-btn'), { durationMs: 2000 });
    }).catch((err) => {
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

    container.innerHTML = AppState.content.references.map(ref => {
        const url = (typeof ref.url === 'string' ? ref.url : '').trim();
        const isHttpUrl = url.startsWith('http://') || url.startsWith('https://');

        const titleHtml = isHttpUrl
            ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${ref.title}</a>`
            : `<span class="reference-title">${ref.title}</span>`;

        return `
            <div class="reference-item">
                ${titleHtml}
                <div class="reference-source">${ref.source}</div>
            </div>
        `;
    }).join('');
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
        const navToggle = document.getElementById('navToggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }
    }
});
