package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.program.StudyProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyProgramRepository extends JpaRepository<StudyProgram, Integer> {
    // Iespējams pievienot meklēšanu pēc nosaukuma u.c. kritērijiem nākotnē
}
