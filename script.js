const submitButton = document.getElementById("submitButton");
const inputText = document.getElementById("inputText");
const apiUrl = "https://us-central1-famous-sunbeam-382202.cloudfunctions.net/function-3";
const loadingSpinner = document.getElementById("loadingSpinner");
const audioContainer = document.getElementById("audioContainer");
let audioContext;

submitButton.addEventListener("click", async () => {
    const inputValue = inputText.value;

    if (inputValue) {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            loadingSpinner.style.display = "block"; // Show loading spinner

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: inputValue })
            });

            if (response.ok) {
                const blob = await response.blob();
                const audioURL = URL.createObjectURL(blob);

                const audioBuffer = await audioContext.decodeAudioData(await blob.arrayBuffer());
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();

                // Embed the MP3 on the page
                const audioElement = document.createElement("audio");
                audioElement.src = audioURL;
                audioElement.controls = true;
                audioContainer.innerHTML = ""; // Remove the previous audio element if there is one
                audioContainer.appendChild(audioElement);

            } else {
                console.error("Error fetching the MP3 data.");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            loadingSpinner.style.display = "none"; // Hide loading spinner
        }
    } else {
        alert("Please enter some text.");
    }
});
