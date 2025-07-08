package com.example.summitron;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SummitronApplication {

    public static void main(String[] args) {
        // Load environment variables from .env file
        Dotenv dotenv = Dotenv.load();

        // Set the API key as a system property
        System.setProperty("openrouter.api.key", dotenv.get("OPENROUTER_API_KEY"));

        SpringApplication.run(SummitronApplication.class, args);
    }

}
