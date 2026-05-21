package lv.venta.coursecatalog.service.security;

/**
 * Paroles politika pēc OWASP labākās prakses.
 * Min 8 simboli, vismaz viens lielais burts, viens mazais burts un viens skaitlis.
 * Īpašie simboli ir atļauti, bet ne obligāti.
 */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 8;

    private PasswordPolicy() { }

    /**
     * Pārbauda, vai parole atbilst politikai.
     * Atgriež null, ja viss kārtībā, vai kļūdas ziņojumu lietotājam.
     */
    public static String validate(String password) {
        if (password == null || password.isBlank()) {
            return "Parole ir obligāta.";
        }
        if (password.length() < MIN_LENGTH) {
            return "Parolei jābūt vismaz " + MIN_LENGTH + " simbolus garai.";
        }
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        if (!hasUpper || !hasLower || !hasDigit) {
            return "Parolei jāsatur vismaz viens lielais burts, viens mazais burts un viens skaitlis.";
        }
        return null;
    }
}
