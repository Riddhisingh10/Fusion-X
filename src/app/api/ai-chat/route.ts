import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, image, history = [] } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
        }

        // System prompt to enforce academic study-only focus
        const systemPrompt = `You are an expert AI tutor for the Connect & Prep college platform.
Strict Policy:
- Answer ONLY study-related, academic, exam preparation, or educational questions.
- If the user asks non-academic, casual, off-topic, or personal questions (e.g. movies, sports, jokes, gaming, general chit-chat), you must politely decline to answer, stating: "I can only help with academic and study-related topics."`;

        // Format history for Ollama chat API
        const ollamaMessages = [
            { role: 'system', content: systemPrompt },
            ...history.map((m: any) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
                ...(m.image ? { images: [m.image.split(',')[1] || m.image] } : {})
            })),
            { 
                role: 'user', 
                content: message,
                ...(image ? { images: [image.split(',')[1] || image] } : {})
            }
        ];

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 180000); // 180-second timeout (3 minutes) for local loading

            const response = await fetch('http://127.0.0.1:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gemma4:latest',
                    messages: ollamaMessages,
                    stream: false,
                    options: {
                        temperature: 0.7
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Ollama responded with status ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const reply = data.message?.content || 'No response from local model.';
            
            return NextResponse.json({ text: reply }, { status: 200 });

        } catch (ollamaErr: any) {
            console.error('Ollama connection error:', ollamaErr);
            
            const academicKeywords = [
                'voltage', 'diode', 'circuit', 'pcb', 'transistor', 'capacitor', 'resistor', 'network',
                'osi model', 'tcp', 'ip', 'ethernet', 'communication', 'optical', 'frequency', 'signal',
                'fourier', 'laplace', 'differential', 'integral', 'math', 'physics', 'chemistry', 'electronics',
                'electrical', 'microcontroller', 'embedded', 'sensor', 'programming', 'code', 'algorithm',
                'op-amp', 'amplifier', 'altium', 'kicad', 'schematic', 'soldering', 'induction', 'transformer',
                'motor', 'maxwell', 'electromagnetic', 'wave', 'antenna', 'laser', 'fiber', '5g', 'lte', 'study',
                'exam', 'explain', 'how to', 'what is', 'solve', 'derive', 'definition'
            ];
            
            const cleanText = message.toLowerCase();
            const isAcademic = academicKeywords.some(keyword => cleanText.includes(keyword)) || message.length > 30;

            let fallbackMessage = '';
            
            if (isAcademic) {
                fallbackMessage = `⚠️ **[Local Ollama Server Offline - Demo Tutor Mode]**

Could not connect to your local Ollama service at **http://127.0.0.1:11434**. To enable fully private dynamic AI, start Ollama and run \`ollama pull gemma4:latest\`.

Here is a study assistant response for your query *"${message}"*:

- **Topic Overview**: Your query relates to core engineering study areas (Electronics, Electrical, PCB, or Communication Networks).
- **Core Concept**: 
  1. For circuits/hardware, ensure proper ground plane separation and trace impedance matching.
  2. For networks, follow layered models (OSI/TCP-IP) to guarantee reliable routing and message framing.
- **Formulas & Rules**: 
  - V = I * R (Ohm's Law)
  - f_c = 1 / (2 * pi * R * C) (Cutoff frequency for active filters)

*Ask another study question or start your local Ollama server to unlock full generative AI responses.*`;
            } else {
                fallbackMessage = `⚠️ **[Local Ollama Server Offline - Non-Academic Query Blocked]**

Could not connect to your local Ollama service at **http://127.0.0.1:11434**.

**Prepcare Tutor Policy:**
I received your query: *"${message}"*.
I can only help with academic and study-related topics (like Electronics, Electricals, PCB Designing, or Communication Networks).

Please make sure to query me only with academic problems. Once Ollama is running with \`gemma4:latest\`, we will utilize your local GPU/CPU for fully private, locally-processed answers!`;
            }
            
            return NextResponse.json({ text: fallbackMessage, offline: true }, { status: 200 });
        }

    } catch (err: any) {
        console.error('API Error in ai-chat:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
