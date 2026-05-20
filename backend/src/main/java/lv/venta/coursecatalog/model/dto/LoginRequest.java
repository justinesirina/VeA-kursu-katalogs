package lv.venta.coursecatalog.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Login pieprasījuma ķermenis — e-pasts un parole.
 */
public record LoginRequest(
        @Email(message = "Nepareizs e-pasta formāts")
        @NotBlank(message = "E-pasts ir obligāts")
        String email,

        @NotBlank(message = "Parole ir obligāta")
        String password
) {}
