package lv.venta.coursecatalog.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Lietotāja izveides pieprasījums ar paroli (F13 prasība).
 * Paroles politika tiek pārbaudīta servisā ar PasswordPolicy.
 */
public record CreateUserRequest(
        @NotBlank(message = "Vārds ir obligāts") String name,
        @NotBlank(message = "Uzvārds ir obligāts") String surname,
        @Email(message = "Nepareizs e-pasta formāts")
        @NotBlank(message = "E-pasts ir obligāts") String email,
        String academicDegree,
        String position,
        @NotNull(message = "Loma ir obligāta") Integer roleId,
        @NotBlank(message = "Parole ir obligāta") String password,
        Boolean active
) {}
