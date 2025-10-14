# Use Eclipse Temurin JDK 21 for building
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Normalize line endings (in case file was checked out with CRLF on Windows)
# and make gradlew executable so the shebang works inside the Alpine builder image.
RUN sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Runtime stage with JRE only
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
  adduser -S appuser -u 1001

# Create uploads directory
RUN mkdir -p uploads && chown appuser:appuser uploads

# Copy the JAR file from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership to appuser
RUN chown appuser:appuser app.jar

USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]