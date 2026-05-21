package lv.venta.coursecatalog.model.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Paroles atiestatīšanas pieprasījums (F13 prasība).
 * Tiek izsaukts no admin lietotāju pārvaldības — admin uzstāda jaunu paroli
 * lietotājam, kurš to aizmirsis. Paroles politika tiek pārbaudīta servisā.
 */
public record ResetPasswordRequest(
        @NotBlank(message = "Jaunā parole ir obligāta") String newPassword
) {}
