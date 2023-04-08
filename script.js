document.getElementById("submitButton").addEventListener("click", async () => {
    const inputText = document.getElementById("inputText").value;
    const apiUrl = "https://us-central1-famous-sunbeam-382202.cloudfunctions.net/function-3";

    if (inputText) {
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: inputText })
            });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const audioContext = new AudioContext();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
            } else {
                console.error("Error fetching the MP3 data.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        alert("Please enter some text.");
    }
});
