package com.example.summitron;

import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class SummarizationService {

    @Value("${together.api.key:}")
    private String togetherApiKey;

    private static final String API_URL = "https://api.together.xyz/v1/chat/completions";
    private final OkHttpClient client = new OkHttpClient();

    public String summarize(String url) {
        try {
            if (togetherApiKey == null || togetherApiKey.isEmpty() || togetherApiKey.startsWith("$")) {
                System.out.println("API Key Error: " + togetherApiKey);
                return "Error: Together AI API key is not configured. Please set the TOGETHER_API_KEY environment variable.";
            }

            System.out.println("Attempting to summarize URL: " + url);
            
            // 1. Fetch and parse the article content from the URL
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
                    .timeout(60000) // 60 seconds
                    .get();
            String articleText = doc.body().text();
            System.out.println("Article text length: " + articleText.length());

            // Truncate the article text to a safe length
            int maxLength = 20000; // Approx. 5000 tokens
            if (articleText.length() > maxLength) {
                articleText = articleText.substring(0, maxLength);
            }

            // 2. Prepare the request for Together AI API
            MediaType mediaType = MediaType.parse("application/json");
            
            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", "Summarize the following article in a few concise paragraphs:\n\n" + articleText);
            
            JSONArray messages = new JSONArray();
            messages.put(message);
            
            JSONObject jsonBody = new JSONObject();
            jsonBody.put("model", "togethercomputer/llama-2-70b-chat");
            jsonBody.put("messages", messages);
            jsonBody.put("max_tokens", 512);
            
            RequestBody body = RequestBody.create(jsonBody.toString(), mediaType);
            
            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(body)
                    .addHeader("Authorization", "Bearer " + togetherApiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();
            
            // 3. Execute the request and get the response
            try (Response response = client.newCall(request).execute()) {
                System.out.println("API Response Status: " + response.code());
                
                if (!response.isSuccessful()) {
                    String errorBody = response.body().string();
                    System.out.println("API Error Response: " + errorBody);
                    return "Error: Failed to get summary from Together AI. Status: " + response.code() + " " + errorBody;
                }
                
                String responseBody = response.body().string();
                System.out.println("API Response Body: " + responseBody);
                
                JSONObject jsonResponse = new JSONObject(responseBody);
                JSONArray choices = jsonResponse.getJSONArray("choices");
                if (choices.length() > 0) {
                    String summary = choices.getJSONObject(0).getJSONObject("message").getString("content").trim();
                    System.out.println("Generated Summary: " + summary);
                    return summary;
                }
                return "Error: No summary was returned by the API.";
            }
        } catch (IOException e) {
            return "Error: Failed to fetch the article. Please check the URL and ensure the website allows scraping. Details: " + e.getMessage() + "\nURL: " + url;
        } catch (Exception e) {
            return "An unexpected error occurred: " + e.getMessage();
        }
    }
}
