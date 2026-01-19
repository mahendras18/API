const sendBtn = document.getElementById("sendBtn");
const replyBox = document.getElementById("reply");

sendBtn.addEventListener("click", async () => {
    const text = document.getElementById("text").value;
    const language = document.getElementById("language").value;

    if (!text.trim()) {
        replyBox.innerText = "Please enter a message.";
        return;
    }

    replyBox.innerText = "Thinking...";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text, language })
        });

        const data = await response.json();
        replyBox.innerText = data.reply;
    } catch (error) {
        replyBox.innerText = "Server error. Check console.";
        console.error(error);
    }
});
