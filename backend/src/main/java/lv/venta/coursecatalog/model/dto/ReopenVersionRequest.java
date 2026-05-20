package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * F8 — Pasniedzējs atver noraidītu versiju labošanai (Noraidīts → Melnraksts).
 * Lietotājs tiek ņemts no Spring Security konteksta.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReopenVersionRequest {
    private String comment;
}
