package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * F8 — Pasniedzējs atver noraidītu versiju labošanai (Noraidīts → Melnraksts).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReopenVersionRequest {
    private Integer actorUserId;
    private String comment;
}
