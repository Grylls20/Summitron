package com.example.summitron;

import com.google.cloud.language.v1.*;
import com.google.cloud.language.v1.Document.Type;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class SummarizationService {

    @Value("${google.api.key}")
    private String googleApiKey;

    public String summarize(String url) {
        try {
            if (googleApiKey == null || googleApiKey.isEmpty() || googleApiKey.equals("${google.api.key}")) {
                return "Error: Google Cloud API key is not configured. Please ensure it is set in your environment.";
            }

            // Set the Google API key in the environment
            System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", googleApiKey);

            // 1. Fetch and parse the article content from the URL
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
                    .timeout(60000) // 60 seconds
                    .get();
            String articleText = doc.body().text();

            // Truncate the article text to a safe length
            int maxLength = 5000; // Google's recommended max length
            if (articleText.length() > maxLength) {
                articleText = articleText.substring(0, maxLength);
            }

            // 2. Use Google's Natural Language API for summarization
            try (LanguageServiceClient language = LanguageServiceClient.create()) {
                // Set the content and type of the document
                com.google.cloud.language.v1.Document document =
                    com.google.cloud.language.v1.Document.newBuilder()
                        .setContent(articleText)
                        .setType(Type.PLAIN_TEXT)
                        .build();

                // Analyze the document's entities
                AnalyzeEntitiesRequest request =
                    AnalyzeEntitiesRequest.newBuilder()
                        .setDocument(document)
                        .setEncodingType(EncodingType.UTF8)
                        .build();

                AnalyzeEntitiesResponse response = language.analyzeEntities(request);
                
                // Extract key entities as a simple summary
                StringBuilder summary = new StringBuilder("Key entities in the article:\n");
                for (Entity entity : response.getEntitiesList()) {
                    if (entity.getSalience() > 0.01) { // Only include significant entities
                        summary.append("- ").append(entity.getName()).append(" (")
                              .append(entity.getType()).append(")\n");
                    }
                }
                
                // Add document sentiment
                AnalyzeSentimentResponse sentimentResponse = language.analyzeSentiment(document);
                Sentiment sentiment = sentimentResponse.getDocumentSentiment();
                summary.append("\nOverall Sentiment: ")
                      .append(String.format("%.2f", sentiment.getScore()))
                      .append(" (")
                      .append(sentiment.getScore() >= 0 ? "Positive" : "Negative")
                      .append(")");
                
                return summary.toString();
            }
        } catch (IOException e) {
            return "Error: Failed to fetch the article. Please check the URL and ensure the website allows scraping. Details: " + e.getMessage();
        } catch (Exception e) {
            return "An unexpected error occurred: " + e.getMessage();
        }
    }
}
