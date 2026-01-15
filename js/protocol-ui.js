// ========================================
// واجهة المستخدم للبروتوكول التفاعلي
// ========================================

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
    renderProtocolUI();
    protocol.enableAutoSave();
    updateProgress();

    // حفظ عند كتابة أي إجابة
    document.addEventListener('input', function (e) {
        if (e.target.matches('textarea, input[type="text"]')) {
            const questionId = e.target.dataset.questionId;
            protocol.saveAnswer(questionId, e.target.value);
            updateProgress();
        }
    });
});

// عرض واجهة البروتوكول
function renderProtocolUI() {
    const container = document.getElementById('protocol-content');
    let html = '';

    // الجزء 1: الصباح
    html += renderPart1();

    // الجزء 2: النهار
    html += renderPart2();

    // الجزء 3: المساء
    html += renderPart3();

    container.innerHTML = html;

    // استعادة الإجابات المحفوظة
    restoreSavedAnswers();
}

// عرض الجزء 1
function renderPart1() {
    const part = protocol.protocolData.part1;
    let html = `
        <div class="card">
            <div class="step-header">
                <div class="step-number">الخطوة الأولى</div>
                <h2 class="step-title">الجزء 1: الصباح - حفر في النفس</h2>
                <div class="step-duration">⏱️ ${part.duration}</div>
            </div>
        </div>
    `;

    part.questions.forEach((q, index) => {
        html += `
            <div class="question-block fade-in">
                <label class="question-text">
                    <span class="question-number">${index + 1}</span>
                    ${q.text}
                </label>
                ${q.hint ? `<p class="form-hint">💡 ${q.hint}</p>` : ''}
                
                ${q.type === 'detailed' && q.subQuestions ? `
                    <div class="sub-questions">
                        ${q.subQuestions.map((sub, subIndex) => `
                            <div class="sub-question">${String.fromCharCode(97 + subIndex)}. ${sub}</div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <textarea 
                    class="form-control" 
                    rows="${q.rows || 4}"
                    data-question-id="${q.id}"
                    placeholder="اكتب إجابتك هنا..."></textarea>
            </div>
        `;
    });

    return html;
}

// عرض الجزء 2
function renderPart2() {
    const part = protocol.protocolData.part2;
    let html = `
        <div class="card mt-4">
            <div class="step-header">
                <div class="step-number">الخطوة الثانية</div>
                <h2 class="step-title">الجزء 2: طول اليوم</h2>
                <div class="step-duration">⏱️ طول اليوم</div>
            </div>
        </div>
        
        <div class="alert alert-info">
            <strong>📱 تذكير سريّع:</strong> ظبّط منبهات في موبايلك للأوقات الجاية دي عشان تجاوب كل سؤال في وقتو.
        </div>
    `;

    // الأسئلة الموقوتة
    part.timedQuestions.forEach((q) => {
        html += `
            <div class="question-block fade-in">
                <label class="question-text">
                    <span class="badge badge-primary">${q.time}</span>
                    ${q.text}
                </label>
                <textarea 
                    class="form-control" 
                    rows="3"
                    data-question-id="${q.id}"
                    placeholder="اكتب إجابتك هنا..."></textarea>
            </div>
        `;
    });

    // الأسئلة التأملية
    html += `<h3 class="mt-4 mb-3">🤔 شوية تأمل</h3>`;
    part.reflections.forEach((q) => {
        html += `
            <div class="question-block fade-in">
                <label class="question-text">${q.text}</label>
                <textarea 
                    class="form-control" 
                    rows="3"
                    data-question-id="${q.id}"
                    placeholder="اكتب إجابتك هنا..."></textarea>
            </div>
        `;
    });

    return html;
}

// عرض الجزء 3
function renderPart3() {
    const part = protocol.protocolData.part3;
    let html = `
        <div class="card mt-4">
            <div class="step-header bg-gradient-accent">
                <div class="step-number">الخطوة الثالثة</div>
                <h2 class="step-title">الجزء 3: المساء - الرؤية كاملة</h2>
                <div class="step-duration">⏱️ 30-45 دقيقة</div>
            </div>
        </div>
        
        <h3 class="mt-4 mb-3">🎯 الخلاصة بتركيز</h3>
    `;

    // أسئلة التوليف
    part.synthesis.forEach((q, index) => {
        html += `
            <div class="question-block fade-in">
                <label class="question-text">
                    <span class="question-number">${24 + index}</span>
                    ${q.text}
                </label>
                ${q.hint ? `<p class="form-hint">💡 ${q.hint}</p>` : ''}
                <textarea 
                    class="form-control" 
                    rows="3"
                    data-question-id="${q.id}"
                    placeholder="اكتب إجابتك هنا..."></textarea>
            </div>
        `;
    });

    // العدسات
    html += `
        <div class="card mt-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <h3 style="color: white; text-align: center; margin-bottom: 1.5rem;">🎯 حدد أهدافك (الرؤية الجديدة)</h3>
        </div>
    `;

    part.lenses.forEach((lens) => {
        html += `
            <div class="question-block fade-in">
                <label class="question-text">
                    <strong>${lens.name}</strong><br>
                    ${lens.text}
                </label>
                ${lens.hint ? `<p class="form-hint">💡 ${lens.hint}</p>` : ''}
                <textarea 
                    class="form-control" 
                    rows="3"
                    data-question-id="${lens.id}"
                    placeholder="اكتب إجابتك هنا..."></textarea>
            </div>
        `;
    });

    // زر الانتهاء
    html += `
        <div class="text-center mt-4">
            <button onclick="completeProtocol()" class="btn btn-primary btn-lg">
                ✅ كدا خلصنا البروتوكول - نمشي لنظام اللعبة
            </button>
        </div>
    `;

    return html;
}

// استعادة الإجابات المحفوظة
function restoreSavedAnswers() {
    const textareas = document.querySelectorAll('textarea[data-question-id]');
    textareas.forEach(textarea => {
        const questionId = textarea.dataset.questionId;
        const answer = protocol.getAnswer(questionId);
        if (answer) {
            textarea.value = answer;
        }
    });
}

// تحديث شريط التقدم
function updateProgress() {
    const summary = protocol.getSummary();
    const progress = summary.completionPercentage;

    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('progress-bar').textContent = progress + '%';
    document.getElementById('answered-count').textContent = summary.answeredQuestions;

    // تحديث حالة الحفظ
    const savedData = storage.load();
    if (savedData && savedData.lastSaved) {
        const saveTime = new Date(savedData.lastSaved).toLocaleTimeString('ar');
        document.getElementById('save-status').textContent = `💾 آخر حفظ تلقائي: ${saveTime}`;
    }
}

// استيراد ملف
async function handleImport(input) {
    if (input.files && input.files[0]) {
        try {
            const result = await storage.importJSON(input.files[0]);
            if (result.success) {
                location.reload(); // إعادة تحميل الصفحة
            }
        } catch (error) {
            alert('خطأ في استيراد الملف: ' + error.error);
        }
    }
}

// إكمال البروتوكول
function completeProtocol() {
    const summary = protocol.getSummary();
    if (summary.answeredQuestions < 27) {
        if (!confirm(`إنت لسه ما جاوبتها على كل الأسئلة (${summary.answeredQuestions}/27).. عايز تواصل كدا؟`)) {
            return;
        }
    }

    // الانتقال لنظام اللعبة
    window.location.href = 'game.html';
}
