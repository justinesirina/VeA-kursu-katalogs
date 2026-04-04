package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO klase, kas norāda, ar kādiem vērtēšanas veidiem tiek novērtēts konkrētais kursa rezultāts (SKR),
 * kā arī kuram studiju programmas studiju rezultātam (SPSR) tas atbilst.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultAssessmentDTO {

    // SKR kā teksts (piemēram, “Spēj veikt datu struktūru implementāciju”)
    private String courseResult;

    // SPSR — studiju programmas studiju rezultāts, kuram atbilst šis SKR (var būt null)
    private String spsr;

    // Vērtēšanas komponentes, kas šo rezultātu novērtē (piemēram: “Eksāmens”, “Projekts”)
    private List<String> components;
}
