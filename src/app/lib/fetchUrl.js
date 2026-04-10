export async function fetchUrl(url) {
    try {
        const res = await fetch("https://r.jina.ai/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_JINA_API_KEY}`,
                "Content-Type": "application/json",
                "Accept": "text/plain",
            },
            body: JSON.stringify({ url: `https://www.${url}` }), // ← test with this first
        });

        if (!res.ok) throw new Error(`Jina returned HTTP ${res.status}`);

        // Accept: text/plain → response is plain text, not JSON
        const cleanMarkdown = await res.text();

        if (!cleanMarkdown || cleanMarkdown.length < 30) {
            throw new Error("Jina returned no readable content");
        }

        return cleanMarkdown;
    } catch (error) {
        console.log("Fetch error:", error);
        throw error;
    }
}