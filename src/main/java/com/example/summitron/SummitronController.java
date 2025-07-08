package com.example.summitron;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Autowired;

@Controller
public class SummitronController {

    @Autowired
    private SummarizationService summarizationService;

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @PostMapping("/summarize")
    public String summarize(@RequestParam("url") String url, Model model) {
                String summary = summarizationService.summarize(url);
        model.addAttribute("summary", summary);
        model.addAttribute("url", url);
        return "index";
    }
}
