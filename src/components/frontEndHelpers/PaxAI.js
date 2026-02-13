import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIResponse(userText) {
    try {
        if(!openai){
             return `PaxAI is still on development mode, and you said ${userText}`
        }
        const res = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: userText }],
            temperature: 0.7,
        });
        return res.choices[0].message.content;
    } catch (error) {
        console.log("getAIResponseErr: ", error);
    }
}
