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

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private final OkHttpClient client = new OkHttpClient();

    public String summarize(String url) {
        try {
            if (openaiApiKey == null || openaiApiKey.equals("YOUR_OPENAI_API_KEY_HERE")) {
                return "Error: OpenAI API key is not configured. Please set it in application.properties.";
            }

            // 1. Fetch and parse the article content from the URL
            Document doc = Jsoup.connect(url).get();
            String articleText = doc.body().text(); // A simple way to get text, might need refinement

            // 2. Prepare the request for OpenAI API
            MediaType mediaType = MediaType.parse("application/json");
            JSONObject jsonBody = new JSONObject();
            jsonBody.put("model", "gpt-3.5-turbo-instruct");
            jsonBody.put("prompt", "Summarize the following article in a few concise paragraphs:\n\n" + articleText);
            jsonBody.put("temperature", 0.7);
            jsonBody.put("max_tokens", 200);

            RequestBody body = RequestBody.create(jsonBody.toString(), mediaType);

            Request request = new Request.Builder()
                    .url("https://api.openai.com/v1/completions")
                    .post(body)
                    .addHeader("Authorization", "Bearer " + openaiApiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            // 3. Execute the request and get the response
            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    return "Error: Failed to get summary from OpenAI. Status: " + response.code() + " " + response.body().string();
                }

                String responseBody = response.body().string();
                JSONObject jsonResponse = new JSONObject(responseBody);
                JSONArray choices = jsonResponse.getJSONArray("choices");
                if (choices.length() > 0) {
                    return choices.getJSONObject(0).getString("text").trim();
                }
                return "Error: No summary was returned by the API.";
            }
        } catch (IOException e) {
            e.printStackTrace();
            return "Error: Failed to fetch the article from the URL.";
        } catch (Exception e) {
            e.printStackTrace();
            return "An unexpected error occurred.";
        }
    }
}
