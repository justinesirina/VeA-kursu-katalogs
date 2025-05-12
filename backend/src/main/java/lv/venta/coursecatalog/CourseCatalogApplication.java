package lv.venta.coursecatalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "lv.venta.coursecatalog.model")
public class CourseCatalogApplication {

    public static void main(String[] args) {
        SpringApplication.run(CourseCatalogApplication.class, args);
    }
}
