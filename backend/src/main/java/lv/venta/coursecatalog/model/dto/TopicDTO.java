package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO klase tematiskajām tēmām, kas tiek apskatītas kursā.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicDTO {

    // Tēmas secības numurs (1., 2., 3. utt.)
    private int sequenceNumber;

    // Tēmas nosaukums (piemēram, “Koki”)
    private String title;

    // Papildu tēmas apraksts, ja nepieciešams
    private String description;
}
