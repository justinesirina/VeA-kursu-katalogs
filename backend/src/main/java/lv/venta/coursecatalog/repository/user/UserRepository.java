package lv.venta.coursecatalog.repository.user;

import lv.venta.coursecatalog.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Datu piekļuves slānis lietotājiem – docētājiem, studentiem, administratoriem.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    /** Login plūsmai: atrod lietotāju pēc e-pasta (unikāls). */
    Optional<User> findByEmail(String email);
}
