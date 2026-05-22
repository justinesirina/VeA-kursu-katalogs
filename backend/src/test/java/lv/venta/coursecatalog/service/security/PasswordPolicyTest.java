package lv.venta.coursecatalog.service.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Vienības testi {@link PasswordPolicy} statiskai utilītklasei. Pārbauda F14/NF2 prasību,
 * ka paroles ievades validācija atgriež skaidru kļūdas ziņojumu lietotājam katrā
 * pārkāpuma gadījumā un null, ja parole atbilst politikai.
 */
class PasswordPolicyTest {

    @Test
    void validate_nullPassword_returnsRequiredMessage() {
        String result = PasswordPolicy.validate(null);
        assertNotNull(result);
        assertTrue(result.contains("obligāta"));
    }

    @Test
    void validate_blankPassword_returnsRequiredMessage() {
        String result = PasswordPolicy.validate("   ");
        assertNotNull(result);
        assertTrue(result.contains("obligāta"));
    }

    @Test
    void validate_tooShort_returnsMinLengthMessage() {
        String result = PasswordPolicy.validate("Ab1");
        assertNotNull(result);
        assertTrue(result.contains("vismaz 8"));
    }

    @Test
    void validate_missingUppercase_returnsComplexityMessage() {
        String result = PasswordPolicy.validate("abcdef123");
        assertNotNull(result);
        assertTrue(result.contains("lielais burts"));
    }

    @Test
    void validate_missingLowercase_returnsComplexityMessage() {
        String result = PasswordPolicy.validate("ABCDEF123");
        assertNotNull(result);
        assertTrue(result.contains("mazais burts"));
    }

    @Test
    void validate_missingDigit_returnsComplexityMessage() {
        String result = PasswordPolicy.validate("AbcdefGh");
        assertNotNull(result);
        assertTrue(result.contains("skaitlis"));
    }

    @Test
    void validate_minLengthMet_andComplexityMet_returnsNull() {
        // 8 simboli, lielais, mazais, cipars
        assertNull(PasswordPolicy.validate("Parole1A"));
    }

    @Test
    void validate_longPasswordWithSpecialChars_returnsNull() {
        // Īpašie simboli ir atļauti, ne obligāti
        assertNull(PasswordPolicy.validate("MyP@ssw0rd!ŠāĀ"));
    }
}
