package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO klase priekšnosacījumu kursiem, kas nepieciešami šī kursa apguvei.
 * Var būt obligātie vai ieteicamie kursi.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrerequisiteDTO {

    // Priekšnosacījuma kursa nosaukums (piemēram: “Datu bāzu pamati”)
    private String title;

    // Priekšnosacījuma veids – “obligāts” vai “ieteicams”
    private String type;
}
