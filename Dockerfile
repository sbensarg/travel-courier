# ── Stage 1: Build ──────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN ./mvnw dependency:go-offline -q

COPY src src
RUN ./mvnw clean package -Pproduction -DskipTests -q

# ── Stage 2: Run ────────────────────────────────────────────
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Use shell form so $PORT is resolved by the shell at runtime
CMD java -jar app.jar --server.port=${PORT:-8080}