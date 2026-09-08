package com.smartbus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartBusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartBusApplication.class, args);
        System.out.println("\n" +
            "╔══════════════════════════════════════════════╗\n" +
            "║         🚌 SmartBus is Running!              ║\n" +
            "║   http://localhost:8080                       ║\n" +
            "║   H2 Console: http://localhost:8080/h2-console║\n" +
            "║   Demo Login: demo / demo123                  ║\n" +
            "╚══════════════════════════════════════════════╝\n");
    }
}
