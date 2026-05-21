package lv.venta.coursecatalog.model.user;

/**
 * Lomu identifikatori, ko izmanto autorizācijas pārbaudēs.
 * Atbilst definētajām 6 lomām.
 * Lietotāja redzamā lomas etiķete glabājas UserRole.roleName.
 */
public enum RoleKey {
    GUEST,
    STUDENT,
    TEACHER,
    PROGRAM_DIRECTOR,
    ADMIN,
    SYSTEM_ADMIN
}
