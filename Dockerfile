# ── Stage 1: Build ──────────────────────────────────────────
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and pom first (better layer caching)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies first (cached if pom.xml unchanged)
RUN ./mvnw dependency:go-offline -q

# Copy source and build production JAR
COPY src src
RUN ./mvnw clean package -Pproduction -DskipTests -q

# ── Stage 2: Run ────────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy only the built JAR from stage 1
COPY --from=builder /app/target/*.jar app.jar

# Railway sets PORT env var automatically
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT:8080}"]
