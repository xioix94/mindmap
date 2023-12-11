package com.example.mindmap.controller;

import java.io.FileOutputStream;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.mindmap.service.SpeechToText;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://localhost:5173")
public class ServiceController {
	// Log 확인용
	private final Logger log = LoggerFactory.getLogger(ServiceController.class);
	
    @PostMapping("/voice")
    public String testVoice(@RequestBody byte[] blobData) throws IOException {
    	String result = "Success";
    	String filePath = "/root/output.ogg";
    	
    	try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(blobData);
        }
    	
    	log.info("Request Body: '{}'", blobData);
    	
        SpeechToText.syncRecognizeFile(filePath);

    	return result;
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