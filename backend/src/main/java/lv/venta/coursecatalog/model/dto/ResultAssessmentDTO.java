package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO klase, kas norāda, ar kādiem vērtēšanas veidiem tiek novērtēts konkrētais kursa rezultāts (SKR),
 * kā arī kuram studiju programmas studiju rezultātam (SPSR) tas atbilst.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultAssessmentDTO {

    // CourseResult ieraksta ID (vajadzīgs rediģēšanai)
    private UUID courseResultId;

    // SKR kā teksts (piemēram, "Spēj veikt datu struktūru implementāciju")
    private String learningOutcome;

    // Kategorijas nosaukums (piemēram: "Zināšanas", "Prasmes", "Kompetences")
    private String categoryName;

    // Kategorijas kārtas numurs eksportam un skatam (Zināšanas=1, Prasmes=2, Kompetences=3)
    private Integer categoryOrder;

    // Formatēta SKR numerācija eksportam — piemēram "SKR 1.1", "SKR 2.3"
    // Pirmais cipars = categoryOrder, otrais = SKR sērijas numurs kategorijā
    private String displayNumber;

    // SPSR — studiju programmas studiju rezultāts, kuram atbilst šis SKR (var būt null)
    private String spsr;

    // Vērtēšanas komponentes, kas šo rezultātu novērtē (piemēram: "Eksāmens", "Projekts")
    private List<String> components;
}
