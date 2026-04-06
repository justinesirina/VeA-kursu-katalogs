package lv.venta.coursecatalog.repository.support;

import lv.venta.coursecatalog.model.support.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repozitorijs valodu datu piekļuvei.
 */
@Repository
public interface LanguageRepository extends JpaRepository<Language, Integer> {
    Optional<Language> findByCodeIgnoreCase(String code);
}
