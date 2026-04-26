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

# JAR is copied as app.jar — this is what we run
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# app.jar is in /app/app.jar — correct path
ENTRYPOINT ["java", "-jar", "/app/app.jar"]