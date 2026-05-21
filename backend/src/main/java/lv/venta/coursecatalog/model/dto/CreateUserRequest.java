package lv.venta.coursecatalog.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Lietotāja izveides pieprasījums (F13 prasība).
 * Parole nav obligāta, ja konts ir neaktīvs (paredzēts autoru/pasniedzēju
 * sarakstam, kas paši nelietos sistēmu). Aktīviem kontiem parole obligāta.
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
        String password,
        Boolean active
) {}
