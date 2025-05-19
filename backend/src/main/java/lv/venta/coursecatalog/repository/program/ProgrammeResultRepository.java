package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.program.ProgrammeResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProgrammeResultRepository extends JpaRepository<ProgrammeResult, UUID> {

    // Šobrīd izmantojam JpaRepository standarta metodes (save, findById, findAll, deleteById utt.)
    // Papildu metodes var pievienot vēlāk, ja radīsies vajadzība
}
