// ========================================
// محرك البروتوكول - 27 سؤال في 3 أجزاء
// ========================================

class ProtocolEngine {
    constructor() {
        this.currentStep = 0;
        this.answers = {};
        this.autoSaveInterval = null;

        // بيانات البروتوكول الكاملة
        this.protocolData = {
            part1: {
                name: "الجزء 1: الصباح - الحفر النفسي",
                duration: "15-30 دقيقة",
                questions: [
                    // قسم أ: الوعي بالألم (Q1-Q4)
                    {
                        id: 'q1',
                        text: "شنو هو الإحباط المستمر الـ إتعودت عليه وبقيت عايش بيه؟",
                        hint: "ما المقصود ألم شديد، بس الحاجة الـ بقيت بتتحملها وخلاص.",
                        type: "textarea"
                    },
                    {
                        id: 'q2',
                        text: "شنو الحاجات الـ بتشتكي منها دايماً بس ما بتغيرها أبداً؟ أكتب 3 شكاوى:",
                        hint: "خليك صادق - شنو الحاجات الـ بتكررها دايماً في كلامك؟",
                        type: "textarea",
                        rows: 5
                    },
                    {
                        id: 'q3',
                        text: "بالنسبة للشكاوى دي: لو في زول بيراقب أفعالك (مش كلامك)، حيفتكر إنك عايز شنو فعلاً؟",
                        hint: "صدّق السلوك بس. أفعالك هي البتكشف أهدافك الحقيقية.",
                        type: "textarea",
                        rows: 5
                    },
                    {
                        id: 'q4',
                        text: "شنو الحقيقة في حياتك هسي الـ حتكون صعبة شديد لو إعترفت بيها لشخص بتحترمو بجد؟",
                        hint: "السؤال ده صعب، لكن مهم شديد.",
                        type: "textarea"
                    },

                    // قسم ب: الرؤية المضادة (Q5-Q11)
                    {
                        id: 'q5',
                        text: "لو مافي أي حاجة اتغيرت في الـ 5 سنين الجاية، صِف لي يوم 'ثلاثاء' عادي بالتفصيل:",
                        hint: "خليك محدد على قدر ما تقدر.",
                        type: "detailed",
                        subQuestions: [
                            "بتصحى وين؟",
                            "جسمك حيكون حاسس بشنو؟",
                            "أول حاجة بتفكر فيها شنو؟",
                            "منو الحولك؟",
                            "بتعمل شنو من 9 صباحاً لـ 6 مساءً؟",
                            "بتحس بشنو الساعة 10 بالليل؟"
                        ]
                    },
                    {
                        id: 'q6',
                        text: "هسي تخيل إنو مرّت 10 سنين وإنت لسه في نفس المكان:",
                        hint: "المستقبل الأسوأ بعد عشرة سنين.",
                        type: "detailed",
                        subQuestions: [
                            "شنو الفرص الفاتت عليك؟",
                            "شنو الأبواب الـ إتقفلت في وشك؟",
                            "منو الزول الـ فقد الأمل فيك؟",
                            "الناس بيقولوا عنك شنو لما تغيب من المكان؟"
                        ]
                    },
                    {
                        id: 'q7',
                        text: "تخيل إنت هسي في نهاية عمرك، وعشت النسخة 'الآمنة' من حياتك وما غيرت أي حاجة.. التكلفة حتكون شنو؟",
                        hint: "شنو الحاجات الـ كنت حابب تعيشها، تجربها، أو تكونها، بس ما سمحت لنفسك؟",
                        type: "textarea",
                        rows: 6
                    },
                    {
                        id: 'q8',
                        text: "منو في حياتك هسي بيعيش المستقبل الـ وصفتو قبل شوية؟ زول بقالو 5 أو 10 سنين في نفس الطريق؟",
                        hint: "بتحس بشنو لما تفكر إنك حتبقي زيو ولّا نسخة منو؟",
                        type: "textarea"
                    },
                    {
                        id: 'q9',
                        text: "شنو 'الهوية' الـ لازم تتخلى عنها عشان تتغير بجد؟ (أنا النوع الـ ...)",
                        hint: "شنو التكلفة الاجتماعية الـ حتدفعها لو ما بقيت الشخص ده تاني؟",
                        type: "textarea"
                    },
                    {
                        id: 'q10',
                        text: "شنو السبب الحقيقي (والبيخجّل شوية) الـ مانعك تغير حياتك؟",
                        hint: "السبب الوهمي الـ بيحسسك إنك ضعيف، خايف، أو كسلان.. مش السبب المنطقي الـ بتقولو للناس.",
                        type: "textarea"
                    },
                    {
                        id: 'q11',
                        text: "لو كان سلوكك الحالي هو وسيلة عشان 'تحمي' نفسك، إنت بتحمي في شنو بالضبط؟ والتكلفة شنو؟",
                        hint: "خليك صادق مع نفسك - إنت خايف تواجه شنو؟",
                        type: "textarea"
                    },

                    // قسم ج: الرؤية الإيجابية (Q12-Q14)
                    {
                        id: 'q12',
                        text: "هسي أنسى المنطق دقيقة.. لو غمضت عيونك ولقيت نفسك بعد 3 سنين عايش حياة تانية، شنو الحاجة الـ عايزها فعلاً؟ صِف لي يوم 'ثلاثاء' عادي:",
                        hint: "أكتب نفس التفاصيل الـ كتبتها في السؤال رقم 5.",
                        type: "detailed",
                        subQuestions: [
                            "بتصحى وين؟",
                            "جسمك حاسس بشنو؟",
                            "أول حاجة بتفكر فيها شنو؟",
                            "منو الحولك؟",
                            "بتعمل شنو من 9 صباحاً لـ 6 مساءً؟",
                            "بتحس بشنو الساعة 10 بالليل؟"
                        ]
                    },
                    {
                        id: 'q13',
                        text: "لازم تصدّق شنو عن نفسك عشان تحس إنو الحياة الجديدة دي طبيعية ومناسبة ليك؟",
                        hint: "أكتب جملة عن هويتك: 'أنا النوع الـ...'",
                        type: "textarea"
                    },
                    {
                        id: 'q14',
                        text: "شنو الحاجة الواحدة الـ حتعملها الأسبوع ده لو كنت فعلاً بقيت الشخص ده؟",
                        hint: "فعل واحد محدد وتقدر تعملو طوالي.",
                        type: "textarea"
                    }
                ]
            },

            part2: {
                name: "الجزء 2: طوال اليوم - مقاطعة الأوتوماتيكية",
                timedQuestions: [
                    { time: "11:00", id: "q15", text: "أنا هربان من شنو هسي ودافع التمن باللي بعمله ده؟" },
                    { time: "13:30", id: "q16", text: "لو في زول صورك فيديو الساعتين الفاتت دي، حيفتكر إنك عايز شنو من حياتك؟" },
                    { time: "15:15", id: "q17", text: "هل أنا ماشي هسي في طريق الحياة الـ بكرهها، ولا الحياة الـ بتمناها؟" },
                    { time: "17:00", id: "q18", text: "شنو أهم حاجة هسي إنت عامل نفسك ما مهتم بيها وهي في الحقيقة مهمة شديد؟" },
                    { time: "19:30", id: "q19", text: "شنو الحاجات الـ عملتها الليلة عشان خايف على صورتك (هويتك) قدام الناس، مش عشان رغبتك الحقيقية؟" },
                    { time: "21:00", id: "q20", text: "متى حسيت بقمة طاقتك وحيويتك الليلة؟ ومتى حسيت إنك 'ميت' ومنطفي؟" }
                ],
                reflections: [
                    { id: "q21", text: "شنو الـ حيتغير لو بطلت تهتم بإنو الناس يشوفوك بـ [الهوية الـ كتبتها في السؤال 9]؟" },
                    { id: "q22", text: "في أي حتة في حياتك إنت بتضحي بـ 'حيويتك' عشان بس تعيش 'بأمان'؟" },
                    { id: "q23", text: "شنو أصغر خطوة ممكن تعملها بكرة عشان تبدأ تكون الشخص الـ بتمناه؟" }
                ]
            },

            part3: {
                name: "الجزء 3: المساء - دمج الرؤى",
                synthesis: [
                    { id: "q24", text: "بعد اليوم الطويل ده، شنو الحقيقة الـ بانت ليك عن سبب بقاءك في مكانك لسه؟", hint: "خليك واضح ومحدد." },
                    { id: "q25", text: "منو 'العدو' الحقيقي؟ سمّيهو بوضوح.", hint: "ما الظروف ولا الناس.. أقصد النمط أو الفكرة الداخل هسي هي الـ سايقاك." },
                    { id: "q26", text: "أكتب جملة واحدة بتوصف الحاجة الـ 'بترفض' إنو حياتك تبقى زيها.", hint: "دي رؤيتك المضادة.. لازم تحس بيها في قلبك لما تقراها." },
                    { id: "q27", text: "أكتب جملة واحدة بتوصف الحاجة الـ إنت 'بتبني' فيها هسي.", hint: "دي بداية رؤيتك الجديدة، وطبيعي تتطور مع الوقت." }
                ],
                lenses: [
                    {
                        id: "lens_year",
                        name: "رؤية سنة واحدة",
                        text: "شنو الحاجة الـ لازم تحصل خلال سنة عشان تعرف إنك فعلاً كسرت النمط القديم؟",
                        hint: "حاجة واحدة ملموسة."
                    },
                    {
                        id: "lens_month",
                        name: "رؤية شهر واحد",
                        text: "شنو الحاجة الـ لازم تنجزها الشهر ده عشان هدف السنة يفضل ممكن؟",
                        hint: "حاجة حتتعلمها أو تبنيها أو تنجزها الشهر ده."
                    },
                    {
                        id: "lens_daily",
                        name: "العادات اليومية",
                        text: "شنو الـ 2 أو 3 خطوات الـ حتعملهم بكرة؟ (الحاجات الـ الشخص الجديد حيعملهم ببساطة)",
                        hint: "خطوات محددة وتقدر تعملها."
                    }
                ]
            }
        };

        // تحميل البيانات المحفوظة
        this.loadSavedAnswers();
    }

    // تحميل الإجابات المحفوظة
    loadSavedAnswers() {
        const savedData = storage.load();
        if (savedData && savedData.answers) {
            this.answers = savedData.answers;
        }
    }

    // حفظ إجابة
    saveAnswer(questionId, answer) {
        this.answers[questionId] = {
            value: answer,
            timestamp: new Date().toISOString()
        };

        // حفظ في التخزين
        storage.save({ answers: this.answers });
    }

    // الحصول على إجابة
    getAnswer(questionId) {
        return this.answers[questionId]?.value || '';
    }

    // تمكين الحفظ التلقائي
    enableAutoSave() {
        this.autoSaveInterval = storage.enableAutoSave(() => {
            return { answers: this.answers };
        }, 30000); // كل 30 ثانية
    }

    // تعطيل الحفظ التلقائي
    disableAutoSave() {
        storage.disableAutoSave(this.autoSaveInterval);
    }

    // الحصول على ملخص الإجابات
    getSummary() {
        const summary = {
            totalQuestions: 27,
            answeredQuestions: Object.keys(this.answers).length,
            antiVision: this.getAnswer('q26'),
            vision: this.getAnswer('q27'),
            yearGoal: this.getAnswer('lens_year'),
            monthProject: this.getAnswer('lens_month'),
            dailyLevers: this.getAnswer('lens_daily'),
            completionPercentage: Math.round((Object.keys(this.answers).length / 27) * 100)
        };

        return summary;
    }

    // تصدير الإجابات كـ PDF (يحتاج مكتبة خارجية)
    exportPDF() {
        // هذه دالة بسيطة - في التطبيق الحقيقي نستخدم jsPDF
        const summary = this.getSummary();
        const content = this.generatePrintableContent();

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>بروتوكول تحويل حياتك</title>');
        printWindow.document.write('<style>body{font-family:Arial;padding:20px;direction:rtl;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    // توليد محتوى قابل للطباعة
    generatePrintableContent() {
        let html = '<h1 style="text-align:center;">بروتوكول تحويل حياتك - إجاباتي</h1>';
        html += `<p style="text-align:center;">تاريخ: ${new Date().toLocaleDateString('ar')}</p>`;
        html += '<hr>';

        // الجزء 1
        html += '<h2>الجزء 1: الصباح - الحفر النفسي</h2>';
        this.protocolData.part1.questions.forEach((q, index) => {
            const answer = this.getAnswer(q.id);
            if (answer) {
                html += `<div style="margin-bottom:20px;"><strong>س${index + 1}: ${q.text}</strong><br>`;
                html += `<p style="background:#f5f5f5;padding:10px;border-right:3px solid #FF6B35;">${answer.replace(/\n/g, '<br>')}</p></div>`;
            }
        });

        // الجزء 2
        html += '<h2 style="page-break-before:always;">الجزء 2: طوال اليوم</h2>';
        // الأسئلة المؤقتة
        this.protocolData.part2.timedQuestions.forEach((q, index) => {
            const answer = this.getAnswer(q.id);
            if (answer) {
                html += `<div style="margin-bottom:20px;"><strong>${q.time} - ${q.text}</strong><br>`;
                html += `<p style="background:#f5f5f5;padding:10px;">${answer.replace(/\n/g, '<br>')}</p></div>`;
            }
        });

        // التأملات
        this.protocolData.part2.reflections.forEach((q, index) => {
            const answer = this.getAnswer(q.id);
            if (answer) {
                html += `<div style="margin-bottom:20px;"><strong>${q.text}</strong><br>`;
                html += `<p style="background:#f5f5f5;padding:10px;">${answer.replace(/\n/g, '<br>')}</p></div>`;
            }
        });

        // الجزء 3
        html += '<h2 style="page-break-before:always;">الجزء 3: المساء - دمج الرؤى</h2>';
        this.protocolData.part3.synthesis.forEach((q, index) => {
            const answer = this.getAnswer(q.id);
            if (answer) {
                html += `<div style="margin-bottom:20px;"><strong>${q.text}</strong><br>`;
                html += `<p style="background:#f5f5f5;padding:10px;border-right:3px solid #FFD700;">${answer.replace(/\n/g, '<br>')}</p></div>`;
            }
        });

        // العدسات
        html += '<h3 style="background:#1A1A2E;color:white;padding:15px;text-align:center;border-radius:8px;">الأهداف (العدسات)</h3>';
        this.protocolData.part3.lenses.forEach((lens) => {
            const answer = this.getAnswer(lens.id);
            if (answer) {
                html += `<div style="margin-bottom:20px;"><strong>${lens.name}: ${lens.text}</strong><br>`;
                html += `<p style="background:#e7f3ff;padding:15px;border:2px solid #004E89;border-radius:8px;">${answer.replace(/\n/g, '<br>')}</p></div>`;
            }
        });

        return html;
    }
}

// تصدير instance واحد
const protocol = new ProtocolEngine();
