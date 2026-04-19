package com.smartflow.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Properties;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		// Set properties for constrained environments (like HF) with highest priority
		System.setProperty("spring.datasource.hikari.maximum-pool-size", "3");
		System.setProperty("spring.datasource.hikari.minimum-idle", "1");
		System.setProperty("spring.datasource.hikari.idle-timeout", "30000");
		System.setProperty("google.client.id", "800791620013-uj3mtbfo91cb6isaru29mgr6k2rbr3lo.apps.googleusercontent.com");

		SpringApplication.run(DemoApplication.class, args);
	}

}
