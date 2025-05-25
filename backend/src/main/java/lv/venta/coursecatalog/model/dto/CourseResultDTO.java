package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO klase, kas attēlo vienu studiju kursa rezultātu (SKR)
 * kopā ar tam piesaistītajiem studiju programmas rezultātiem.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResultDTO {

    // Rezultāta kategorija: “Zināšanas”, “Prasmes” vai “Kompetences”
    private String category;

    // Sasniedzamais rezultāts formulēts kā teksts
    private String learningOutcome;

    // Sasaiste ar vienu vai vairākiem programmas rezultātiem
    private List<String> linkedProgrammeOutcomes;
}
