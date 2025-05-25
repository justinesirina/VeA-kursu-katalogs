package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO klase, kas apraksta vienu nodarbības veidu kalendārajā plānā,
 * piemēram, “Lekcija – 2 ak. st.”
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionDTO {

    // Nodarbības veids (piemēram, “Lekcija”, “Seminārs”)
    private String sessionType;

    // Akadēmisko stundu skaits
    private int academicHours;
}
