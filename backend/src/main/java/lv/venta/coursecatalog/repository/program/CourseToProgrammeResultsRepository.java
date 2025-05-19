package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.program.CourseToProgrammeResults;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseToProgrammeResultsRepository extends JpaRepository<CourseToProgrammeResults, Integer> {
    // Šobrīd izmantojam tikai pamata CRUD, papildu metodes var pievienot vēlāk
}
