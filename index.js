// import dependencies
import { Voice } from "@signalwire/realtime-api";
import axios from 'axios';

// instantiate client
const client = new Voice.Client({
  project: process.env.PROJECT_ID,
  token: process.env.API_TOKEN,
  contexts: ["poc"],
});

// inbound call
client.on("call.received", async (call) => {
  console.log("Got call", call.from, call.to);

  try {
    await call.answer();
    console.log("Call answered successfully");
  } catch (error) {
    console.error("Error answering call:", error);
  }

  const tts = await call.playTTS({
    text: "Please leave a message with your name and number at the beep. Press the pound key when finished.",
  });
  await tts.waitForEnded();

  // Callback to be executed when the recording ends.
  call.on("recording.ended", async (rec) => {
    const tts = await call.playTTS({
      text: "Thank you for your message. A member of our team will contact you shortly. Goodbye!",
    });
    await tts.waitForEnded();

    console.log("Recording URL:", rec.url);
  
    try {
      await call.hangup();
    } catch (error) {
      console.log("Error hanging up call:", error);
    }  
  });

  const recording = await call.recordAudio({
    endSilenceTimeout: 0,
    terminators: "#",
  });

  // Stop the recording after 15 seconds.
  setTimeout(() => recording.stop(), 15000);
});

client.on("error", (error) => {
  console.error(error);
});

console.log("Started.");