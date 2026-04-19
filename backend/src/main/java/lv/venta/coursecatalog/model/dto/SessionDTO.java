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

    // CalendarSession ID rediģēšanai/dzēšanai
    private int sessionId;

    // SessionType ID
    private int sessionTypeId;

    // Nodarbības veids (piemēram, “Lekcija”, “Seminārs”)
    private String sessionType;

    // Akadēmisko stundu skaits
    private int academicHours;

    // Secības numurs nodarbībai tēmas ietvaros (1., 2., 3. utt.)
    private int sequenceNumber;
}
