package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO klase studējošā patstāvīgā darba sadalījumam.
 * Piemēram: "Literatūras studijas – 20%"
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelfStudyDTO {

    // DB ieraksta ID (vajadzīgs rediģēšanai)
    private int id;

    // Patstāvīgā darba veids (piemēram, "Mājasdarbi")
    private String activityName;

    // Procentuālā daļa no kopējā patstāvīgā darba apjoma
    private int percentage;
}
