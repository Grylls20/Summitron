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

    @Value("${together.api.key}")
    private String togetherApiKey;

    private static final String API_URL = "https://api.together.xyz/v1/chat/completions";

    private final OkHttpClient client = new OkHttpClient();

    public String summarize(String url) {
        try {
            if (togetherApiKey == null || togetherApiKey.isEmpty() || togetherApiKey.equals("${together.api.key}")) {
                return "Error: Together AI API key is not configured. Please ensure it is set in your environment.";
            }

            // 1. Fetch and parse the article content from the URL
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
                    .timeout(60000) // 60 seconds
                    .get();
            String articleText = doc.body().text(); // A simple way to get text, might need refinement

            // 2. Prepare the request for OpenRouter API
            MediaType mediaType = MediaType.parse("application/json");

            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", "Summarize the following article in a few concise paragraphs:\n\n" + articleText);

            JSONArray messages = new JSONArray();
            messages.put(message);

            JSONObject jsonBody = new JSONObject();
            jsonBody.put("model", "meta-llama/Llama-3-70b-chat-hf");
            jsonBody.put("messages", messages);

            RequestBody body = RequestBody.create(jsonBody.toString(), mediaType);

            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(body)
                    .header("Authorization", "Bearer " + togetherApiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            // 3. Execute the request and get the response
            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    return "Error: Failed to get summary from OpenRouter. Status: " + response.code() + " " + response.body().string();
                }

                String responseBody = response.body().string();
                JSONObject jsonResponse = new JSONObject(responseBody);
                JSONArray choices = jsonResponse.getJSONArray("choices");
                if (choices.length() > 0) {
                    return choices.getJSONObject(0).getJSONObject("message").getString("content").trim();
                }
                return "Error: No summary was returned by the API.";
            }
        } catch (IOException e) {
            e.printStackTrace();
            return "Error: Failed to fetch the article. Please check the URL and ensure the website allows scraping. Details: " + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            return "An unexpected error occurred: " + e.getMessage();
        }
    }
}
