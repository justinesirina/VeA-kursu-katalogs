package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * F8 — Pasniedzēja iesniegums versijas apstiprināšanai (Melnraksts → Iesniegts).
 * Lietotājs tiek ņemts no Spring Security konteksta.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitVersionRequest {
    private String comment;
}
