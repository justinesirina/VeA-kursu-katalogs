package lv.venta.coursecatalog.service.security;

import lv.venta.coursecatalog.model.user.RoleKey;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pārbauda kumulatīvo lomu hierarhiju pēc prasibas.md 1.1 punkta.
 */
class RoleHierarchyTest {

    @Test
    void teacherIegustAriStudentaUnViesaTiesibas() {
        Set<RoleKey> effective = RoleHierarchy.allEffectiveRoles(RoleKey.TEACHER);
        assertThat(effective).containsExactlyInAnyOrder(
                RoleKey.GUEST, RoleKey.STUDENT, RoleKey.TEACHER
        );
    }

    @Test
    void programmasDirektorsIegustAriPasniedzejaTiesibas() {
        assertThat(RoleHierarchy.hasRoleAtLeast(RoleKey.PROGRAM_DIRECTOR, RoleKey.TEACHER)).isTrue();
        assertThat(RoleHierarchy.hasRoleAtLeast(RoleKey.PROGRAM_DIRECTOR, RoleKey.STUDENT)).isTrue();
    }

    @Test
    void adminIrAugstaksParProgrammasDirektoru() {
        assertThat(RoleHierarchy.hasRoleAtLeast(RoleKey.ADMIN, RoleKey.PROGRAM_DIRECTOR)).isTrue();
        assertThat(RoleHierarchy.hasRoleAtLeast(RoleKey.PROGRAM_DIRECTOR, RoleKey.ADMIN)).isFalse();
    }

    @Test
    void sistemasAdminIrAugstakaisLimenis() {
        Set<RoleKey> effective = RoleHierarchy.allEffectiveRoles(RoleKey.SYSTEM_ADMIN);
        assertThat(effective).containsExactlyInAnyOrder(RoleKey.values());
    }

    @Test
    void viesisNeiegustNevienasCitasLomasTiesibas() {
        Set<RoleKey> effective = RoleHierarchy.allEffectiveRoles(RoleKey.GUEST);
        assertThat(effective).containsExactly(RoleKey.GUEST);
        assertThat(RoleHierarchy.hasRoleAtLeast(RoleKey.GUEST, RoleKey.STUDENT)).isFalse();
    }

    @Test
    void nullActorVienmerAtgriežFalse() {
        assertThat(RoleHierarchy.hasRoleAtLeast(null, RoleKey.STUDENT)).isFalse();
        assertThat(RoleHierarchy.allEffectiveRoles(null)).isEmpty();
    }

    @Test
    void tapatasLomasPArbaudeAtgriežTrue() {
        for (RoleKey r : RoleKey.values()) {
            assertThat(RoleHierarchy.hasRoleAtLeast(r, r))
                    .as("loma %s pret sevi", r)
                    .isTrue();
        }
    }
}
