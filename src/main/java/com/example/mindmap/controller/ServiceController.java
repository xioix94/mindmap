package com.example.mindmap.controller;

import java.io.BufferedReader;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import com.example.mindmap.service.SpeechToText;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://localhost:5173")
public class ServiceController {
	// Log 확인용
	private final Logger log = LoggerFactory.getLogger(ServiceController.class);
	
    @PostMapping("/voice")
    public String testVoice(@RequestBody byte[] blobData) throws Exception {
    	String result;
    	String directoryPath = "/root";
    	String filePath = directoryPath + "/output.ogg";
    	String resultFilePath = directoryPath + "/result.wav";
    	String[] cmd = {"/bin/sh", "-c", "ffmpeg -y -i " + filePath + " -ar 16000 " + resultFilePath};
    	
    	try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(blobData);
        }
    	
    	log.info("Request Body: '{}'", blobData);
    	
    	try {
    		ProcessBuilder processBuilder = new ProcessBuilder(cmd);
    		Process process = processBuilder.start();
    		BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
    		String line;
            
	      while ((line = reader.readLine()) != null) {
	    	  log.info("Command ffmpeg: '{}'", line);
	        }
	        
	      int exitCode = process.waitFor();
	        
	      if (exitCode == 0) {
	    	  log.info("ffmpeg command success.");
	      } else {
	    	  log.info("ffmpeg command failed error code: '{}'", exitCode);
	        }
	      
    	} catch (IOException | InterruptedException e){
    		e.printStackTrace();
    	}
    	
      result = SpeechToText.syncRecognizeFile(resultFilePath);
      log.info("result : {}.", result);
    	return String.format("{\"result\" : %s}", result);
    }
    
    @GetMapping("/test")
    public String testVoice() {
    	String result = "Success";
    	
    	log.info("Success");
    	
    	return result;
    }
	
	
//	@PostMapping("test")
//	public Object test(@RequestBody String requestBody) throws ParseException {
//		JSONObject jsonObj = null;
//		log.info("Request Body: '{}'", requestBody);
//		Result data = new Result();
//		
//		try {
//			JSONParser jsonParser = new JSONParser();
//			Object obj = jsonParser.parse(requestBody);
//			jsonObj = (JSONObject) obj;	
//			data.Result = "Success";
//		}catch (Exception e) {
//			data.Result = "Fail";
//			//throw e;
//		}
//		
//		if (jsonObj != null) {
//			log.info("test : '{}'", jsonObj.get("test"));
//			log.info("test2 : '{}'", jsonObj.get("test2"));
//		}
//		
//		return data;
}
