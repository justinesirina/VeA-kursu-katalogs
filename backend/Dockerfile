# Izmanto oficiālu OpenJDK attēlu
FROM openjdk:17-jdk-slim

# Mainīgais, kas norāda JAR faila nosaukumu
ARG JAR_FILE=target/course-catalog-1.0-SNAPSHOT.jar

# Iekopē būvēto JAR failu konteinerī
COPY ${JAR_FILE} app.jar

# Palaid aplikāciju
ENTRYPOINT ["java", "-jar", "/app.jar"]
