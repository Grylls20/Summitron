# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-11 AS build
WORKDIR /app

# Copy pom.xml and download dependencies to leverage Docker cache
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the application source code
COPY src ./src

# Package the application, skipping tests
RUN mvn clean package -DskipTests

# Stage 2: Create the final, smaller image
FROM openjdk:11-jre-slim
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/summitron-0.0.1-SNAPSHOT.jar app.jar

# Render provides the PORT environment variable; Spring Boot will use it.
# EXPOSE is for documentation purposes.
EXPOSE 10000

# Command to run the application
CMD ["java", "-jar", "app.jar"]
