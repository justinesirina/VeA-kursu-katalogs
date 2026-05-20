package lv.venta.coursecatalog.service.security;

import lv.venta.coursecatalog.model.user.RoleKey;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Lomu hierarhija. Augstāka loma iegūst
 * visas zemāko lomu tiesības (kumulatīvais princips).
 * Piemēram, ADMIN automātiski drīkst arī to, ko PROGRAM_DIRECTOR un TEACHER.
 */
public final class RoleHierarchy {

    /** Lomas augošā secībā pēc tiesību apjoma — pirmā vājākā, pēdējā stiprākā. */
    private static final List<RoleKey> RANK = List.of(
            RoleKey.GUEST,
            RoleKey.STUDENT,
            RoleKey.TEACHER,
            RoleKey.PROGRAM_DIRECTOR,
            RoleKey.ADMIN,
            RoleKey.SYSTEM_ADMIN
    );

    private RoleHierarchy() { }

    /**
     * Atgriež true, ja actor lomas līmenis ir vismaz tāds pats kā required.
     */
    public static boolean hasRoleAtLeast(RoleKey actor, RoleKey required) {
        if (actor == null || required == null) return false;
        return RANK.indexOf(actor) >= RANK.indexOf(required);
    }

    /**
     * Atgriež visas lomas, ko actor iegūst kumulatīvi (savu un visas zemākās).
     * Izmanto, lai Spring Security GrantedAuthority sarakstā ietvertu visas
     * derīgās lomas — @PreAuthorize("hasRole('TEACHER')") tad strādās arī
     * Programmas direktoram un Administratoram.
     */
    public static Set<RoleKey> allEffectiveRoles(RoleKey actor) {
        if (actor == null) return EnumSet.noneOf(RoleKey.class);
        int actorRank = RANK.indexOf(actor);
        EnumSet<RoleKey> result = EnumSet.noneOf(RoleKey.class);
        for (int i = 0; i <= actorRank; i++) {
            result.add(RANK.get(i));
        }
        return result;
    }
}
