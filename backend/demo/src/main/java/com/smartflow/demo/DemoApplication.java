package com.smartflow.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Properties;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(DemoApplication.class);
		
		// Set default properties to ensure stability and feature-completeness on constrained environments (like HF)
		Properties props = new Properties();
		props.put("spring.datasource.hikari.maximum-pool-size", "3");
		props.put("spring.datasource.hikari.minimum-idle", "1");
		props.put("google.client.id", "800791620013-uj3mtbfo91cb6isaru29mgr6k2rbr3lo.apps.googleusercontent.com");
		app.setDefaultProperties(props);
		
		app.run(args);
	}

}
