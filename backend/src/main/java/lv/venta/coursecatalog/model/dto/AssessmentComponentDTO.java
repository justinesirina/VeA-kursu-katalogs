package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO klase, kas apraksta vērtēšanas komponentes un to īpatsvaru no kopējā vērtējuma.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentComponentDTO {

    // DB ieraksta ID (vajadzīgs rediģēšanai)
    private int id;

    // Komponentes nosaukums, piemēram: "Eksāmens", "Mājasdarbs"
    private String componentName;

    // Procentuālā daļa (kopā visām jāveido 100%)
    private int percentage;
}
