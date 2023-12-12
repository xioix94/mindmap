package com.example.mindmap.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

//Imports the Google Cloud client library
import com.google.cloud.speech.v1.RecognitionAudio;
import com.google.cloud.speech.v1.RecognitionConfig;
import com.google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
import com.google.cloud.speech.v1.RecognizeResponse;
import com.google.cloud.speech.v1.SpeechClient;
import com.google.cloud.speech.v1.SpeechRecognitionAlternative;
import com.google.cloud.speech.v1.SpeechRecognitionResult;
import com.google.protobuf.ByteString;


public class SpeechToText {
/** Demonstrates using the Speech API to transcribe an audio file. */
	public static String syncRecognizeFile(String fileName) throws Exception {
		String text = "";
		try (SpeechClient speech = SpeechClient.create()) {
			Path path = Paths.get(fileName);
			byte[] data = Files.readAllBytes(path);
			ByteString audioBytes = ByteString.copyFrom(data);

			// Configure request with local raw PCM audio
			RecognitionConfig config =
					RecognitionConfig.newBuilder()
					//.setEncoding(AudioEncoding.LINEAR16)
					.setEncoding(AudioEncoding.OGG_OPUS)
					.setLanguageCode("ko-KR")
					.setSampleRateHertz(16000)
					.build();
			RecognitionAudio audio = RecognitionAudio.newBuilder().setContent(audioBytes).build();

		    // Use blocking call to get audio transcript
		    RecognizeResponse response = speech.recognize(config, audio);
		    List<SpeechRecognitionResult> results = response.getResultsList();

		    for (SpeechRecognitionResult result : results) {
		    	// There can be several alternative transcripts for a given chunk of speech. Just use the
		      // first (most likely) one here.
		      SpeechRecognitionAlternative alternative = result.getAlternativesList().get(0);
		      //System.out.printf("Transcription: %s%n", alternative.getTranscript());
		      text += alternative.getTranscript();
		     }
		    
		    return text; 
		}
	}
}