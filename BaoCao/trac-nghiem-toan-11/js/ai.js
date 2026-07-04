/**
 * ai.js - AI Quiz Generation Module (STEM Grade 10-12 Curriculum)
 */

const AIManager = (() => {

    // Curriculum Topic Mappings (Grade -> Subject -> Chapters)
    const CURRICULUM_MAP = {
        "10": {
            "Toán học": [
                "Mệnh đề & Tập hợp",
                "Hàm số bậc hai & Đồ thị",
                "Hệ phương trình bậc nhất",
                "Vectơ & Tọa độ mặt phẳng"
            ],
            "Vật lý": [
                "Động học chuyển động thẳng",
                "Động lực học & Định luật Newton",
                "Năng lượng, Công & Công suất",
                "Động lượng & Va chạm"
            ],
            "Hóa học": [
                "Cấu tạo vỏ Nguyên tử",
                "Bảng tuần hoàn hóa học",
                "Liên kết & Tương tác hóa học",
                "Phản ứng Oxi hóa - Khử"
            ]
        },
        "11": {
            "Toán học": [
                "Hàm số lượng giác & Phương trình",
                "Dãy số & Cấp số cộng/nhân",
                "Giới hạn & Hàm số liên tục",
                "Đạo hàm & Tiếp tuyến",
                "Hình học không gian (Quan hệ song song)"
            ],
            "Vật lý": [
                "Điện tích & Điện trường",
                "Dòng điện không đổi",
                "Cảm ứng điện từ & Từ trường",
                "Dao động cơ học"
            ],
            "Hóa học": [
                "Sự điện li & Cân bằng hóa học",
                "Nhóm Nitơ - Photpho",
                "Đại cương Hóa hữu cơ",
                "Hydrocarbon no/không no"
            ]
        },
        "12": {
            "Toán học": [
                "Khảo sát & Vẽ đồ thị hàm số",
                "Nguyên hàm & Tích phân",
                "Số phức & Hình học phức",
                "Tọa độ không gian Oxyz"
            ],
            "Vật lý": [
                "Dao động điều hòa cơ nâng cao",
                "Dòng điện xoay chiều RLC",
                "Sóng ánh sáng & Giao thoa",
                "Vật lý hạt nhân & Phóng xạ"
            ],
            "Hóa học": [
                "Este, Lipit & Xà phòng hóa",
                "Carbohydrate (Glucozo/Saccarozo)",
                "Amin, Amino Acid & Protein",
                "Polime & Vật liệu polime"
            ]
        }
    };

    // Deep offline fallback question catalog for all subjects & grades
    const FALLBACK_QUIZZES = {
        "Toán học": [
            {
                q: "Tìm tập xác định $D$ của hàm số $y = \\tan x$.",
                a: [
                    "$D = \\mathbb{R} \\setminus \\{k\\pi, k \\in \\mathbb{Z}\\}$",
                    "$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}\\}$",
                    "$D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k2\\pi, k \\in \\mathbb{Z}\\}$",
                    "$D = \\mathbb{R}$"
                ],
                c: 1,
                explain: "Hàm số lượng giác $y = \\tan x$ xác định khi $\\cos x \\neq 0 \\Leftrightarrow x \\neq \\frac{\\pi}{2} + k\\pi$. Do đó tập xác định là $D = \\mathbb{R} \\setminus \\{\\frac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}\\}$."
            },
            {
                q: "Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 2$. Tính $u_5$.",
                a: ["$u_5 = 11$", "$u_5 = 9$", "$u_5 = 13$", "$u_5 = 15$"],
                c: 0,
                explain: "Số hạng tổng quát của cấp số cộng: $u_n = u_1 + (n-1)d$. Do đó: $u_5 = 3 + 4 \\times 2 = 11$."
            }
        ],
        "Vật lý": [
            {
                q: "Một vật chuyển động thẳng biến đổi đều với vận tốc đầu $v_0$, gia tốc $a$. Công thức tính vận tốc $v$ ở thời điểm $t$ là:",
                a: [
                    "$v = v_0 + at$",
                    "$v = v_0 - at$",
                    "$v = v_0 + \\frac{1}{2}at^2$",
                    "$v = v_0^2 + 2as$"
                ],
                c: 0,
                explain: "Phương trình vận tốc của chuyển động thẳng biến đổi đều theo thời gian có dạng cơ bản: $v = v_0 + at$."
            },
            {
                q: "Đặt điện áp xoay chiều $u = U_0 \\cos(\\omega t)$ vào hai đầu cuộn cảm thuần có độ tự cảm $L$. Cảm kháng $Z_L$ của cuộn cảm là:",
                a: [
                    "$Z_L = \\omega L$",
                    "$Z_L = \\frac{1}{\\omega L}$",
                    "$Z_L = \\omega^2 L$",
                    "$Z_L = \\frac{L}{\\omega}$"
                ],
                c: 0,
                explain: "Cảm kháng của cuộn cảm thuần cản trở dòng điện xoay chiều được xác định bởi công thức: $Z_L = \\omega L$."
            }
        ],
        "Hóa học": [
            {
                q: "Kim loại nào sau đây có tính khử mạnh nhất trong dãy hoạt động hóa học?",
                a: ["$Na$", "$Fe$", "$Cu$", "$Ag$"],
                c: 0,
                explain: "Trong các kim loại được liệt kê, Natri ($Na$) là kim loại kiềm đứng trước sắt, đồng và bạc, do đó có tính khử mạnh nhất."
            },
            {
                q: "Chất nào sau đây thuộc loại este no, đơn chức, mạch hở?",
                a: [
                    "$CH_3COOCH_3$",
                    "$CH_2=CHCOOCH_3$",
                    "$CH_3COOH$",
                    "$C_2H_5OH$"
                ],
                c: 0,
                explain: "Metyl axetat ($CH_3COOCH_3$) có công thức phân tử dạng $C_nH_{2n}O_2$ ($n \\ge 2$), là este no, đơn chức, mạch hở điển hình."
            }
        ]
    };

    function getCurriculumMap() {
        return CURRICULUM_MAP;
    }

    async function generateQuiz(grade, subject, topic, level) {
        // Retrieve dynamic settings
        const settings = StorageManager.getSettings();
        const activeKey = settings.customApiKey ? settings.customApiKey.trim() : StorageManager.getDefaultApiKey();

        // Dynamically customize the tutor personality based on the selected subject!
        let systemPrompt = `Bạn là một giảng viên ${subject} trung học phổ thông chuyên nghiệp và uy tín ở Việt Nam.`;
        if (subject === "Toán học") {
            systemPrompt += " Hãy soạn đề thi trắc nghiệm Toán học có ký hiệu công thức LaTeX chuẩn xác.";
        } else if (subject === "Vật lý") {
            systemPrompt += " Hãy soạn đề thi trắc nghiệm Vật lý có lý thuyết và các bài toán tính toán cơ/điện sinh động.";
        } else if (subject === "Hóa học") {
            systemPrompt += " Hãy soạn đề thi trắc nghiệm Hóa học có các phương trình phản ứng hóa học chính xác.";
        }

        const userPrompt = `Tạo 10 câu hỏi trắc nghiệm ${subject} lớp ${grade}. Chủ đề: "${topic}". Mức độ khó: "${level}". 
Định dạng duy nhất JSON: [{"q":"Câu hỏi có LaTeX","a":["A","B","C","D"],"c":index_đúng_0_đến_3,"explain":"Lời giải chi tiết từng bước có LaTeX"}]. 
Lưu ý quan trọng: Dùng duy nhất dấu $ cho công thức Toán (inline). Trả về duy nhất chuỗi JSON hợp lệ, tuyệt đối không bọc trong thẻ markdown \`\`\`json hay bất kỳ văn bản giải thích nào khác.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) throw new Error("Gemini API request failed.");

            const data = await response.json();
            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```json|```/g, '').trim();
            const quizData = JSON.parse(text);
            
            if (Array.isArray(quizData) && quizData.length > 0) {
                return quizData;
            }
            throw new Error("Invalid quiz structure returned from AI.");
        } catch (err) {
            console.warn(`AI Quiz Generation failed for ${subject} ${grade} - ${topic}. Utilizing local fallback questions.`, err);
            
            // Build offline fallback question sets
            const defaultSet = FALLBACK_QUIZZES[subject] || FALLBACK_QUIZZES["Toán học"];
            let finalSet = [...defaultSet];
            while (finalSet.length < 10) {
                defaultSet.forEach(item => {
                    if (finalSet.length < 10) {
                        finalSet.push({
                            ...item,
                            q: `${item.q} (Mục ôn tập bổ sung lớp ${grade} - ${topic})`
                        });
                    }
                });
            }
            return finalSet;
        }
    }

    return {
        getCurriculumMap,
        generateQuiz
    };
})();
