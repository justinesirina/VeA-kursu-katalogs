package lv.venta.coursecatalog.model.dto;

import lv.venta.coursecatalog.model.user.RoleKey;

import java.util.Set;

/**
 * Sesijas info, ko atgriež login un /auth/me galapunkti.
 * Iekļauj kumulatīvās lomas, lai frontend uzreiz var pārbaudīt tiesības.
 */
public record AuthSessionDTO(
        int userId,
        String name,
        String surname,
        String email,
        RoleKey roleKey,
        String roleName,
        Set<RoleKey> effectiveRoles
) {}
