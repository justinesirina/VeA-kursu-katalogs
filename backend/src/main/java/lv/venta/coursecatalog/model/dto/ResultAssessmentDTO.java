package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO klase, kas norāda, ar kādiem vērtēšanas veidiem tiek novērtēts konkrētais kursa rezultāts (SKR).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultAssessmentDTO {

    // SKR kā teksts (piemēram, “Spēj veikt datu struktūru implementāciju”)
    private String courseResult;

    // Vērtēšanas komponentes, kas šo rezultātu novērtē (piemēram: “Eksāmens”, “Projekts”)
    private List<String> components;
}
