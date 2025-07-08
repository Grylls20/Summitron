package com.example.summitron;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

@RestController
public class SummitronController {

    @Autowired
    private SummarizationService summarizationService;

    @PostMapping("/summarize")
    @ResponseBody
    public Map<String, String> summarize(@RequestParam("url") String url) {
        String summary = summarizationService.summarize(url);
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        response.put("summary", summary);
        return response;
    }
}
