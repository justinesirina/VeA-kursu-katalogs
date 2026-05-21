package lv.venta.coursecatalog.repository.user;

import lv.venta.coursecatalog.model.user.RoleKey;
import lv.venta.coursecatalog.model.user.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Datu piekļuves slāņa interfeiss lietotāju lomām (piemēram, "Admin", "Pasniedzējs").
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {

    /** Atrod lomu pēc tās fiksētā identifikatora (role_key). */
    Optional<UserRole> findByRoleKey(RoleKey roleKey);
}
