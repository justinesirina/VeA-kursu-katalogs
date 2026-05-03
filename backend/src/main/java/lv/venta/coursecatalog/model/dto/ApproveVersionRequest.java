package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * F8 — Programmas direktora apstiprinājums (Iesniegts → Apstiprināts).
 * decisionNumber ir obligāts; approvalDate noklusē šodienu, ja nav norādīts.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveVersionRequest {
    private Integer actorUserId;
    private String decisionNumber;
    private LocalDate approvalDate;
    private String decisionReference;
    private String comment;
}
