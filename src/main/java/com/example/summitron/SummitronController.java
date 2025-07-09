package com.example.summitron;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

class SummaryRequest {
    private String url;
    
    // Getters and setters
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
}

@RestController
public class SummitronController {

    @Autowired
    private SummarizationService summarizationService;

    @PostMapping("/api/summarize")
    @ResponseBody
    public Map<String, String> summarize(@RequestBody SummaryRequest request) {
        String summary = summarizationService.summarize(request.getUrl());
        Map<String, String> response = new HashMap<>();
        response.put("url", request.getUrl());
        response.put("summary", summary);
        return response;
    }
}
