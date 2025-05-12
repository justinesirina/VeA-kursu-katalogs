package lv.venta.coursecatalog.repository;

import lv.venta.coursecatalog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Datu piekļuves slānis lietotājiem – docētājiem, studentiem, administratoriem.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}
