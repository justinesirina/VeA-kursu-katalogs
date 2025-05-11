package lv.venta.coursecatalog.repository;

import lv.venta.coursecatalog.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    // Šeit vēlāk jāpievieno custom metodes, piemēram: findByTitle, findByCode utt.
}
