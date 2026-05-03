package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * F8 — Programmas direktora noraidījums (Iesniegts → Noraidīts).
 * comment ir obligāts un kalpo kā noraidījuma iemesls.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectVersionRequest {
    private Integer actorUserId;
    private String comment;
}
