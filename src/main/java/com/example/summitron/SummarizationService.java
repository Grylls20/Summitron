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

    @Value("${openrouter.api.key}")
    private String openrouterApiKey;

    private final OkHttpClient client = new OkHttpClient();

    public String summarize(String url) {
        try {
            if (openrouterApiKey == null || openrouterApiKey.equals("YOUR_OPENROUTER_API_KEY_HERE")) {
                return "Error: OpenRouter API key is not configured. Please set it in application.properties.";
            }

            // 1. Fetch and parse the article content from the URL
            Document doc = Jsoup.connect(url).get();
            String articleText = doc.body().text(); // A simple way to get text, might need refinement

            // 2. Prepare the request for OpenRouter API
            MediaType mediaType = MediaType.parse("application/json");

            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", "Summarize the following article in a few concise paragraphs:\n\n" + articleText);

            JSONArray messages = new JSONArray();
            messages.put(message);

            JSONObject jsonBody = new JSONObject();
            jsonBody.put("model", "google/gemini-flash-1.5");
            jsonBody.put("messages", messages);

            RequestBody body = RequestBody.create(jsonBody.toString(), mediaType);

            Request request = new Request.Builder()
                    .url("https://openrouter.ai/api/v1/chat/completions")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + openrouterApiKey)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("HTTP-Referer", "http://localhost:9000") // Required by OpenRouter for free-tier
                    .addHeader("X-Title", "Summitron") // Required by OpenRouter for free-tier
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
