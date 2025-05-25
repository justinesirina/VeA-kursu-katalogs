package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO klase, kas attēlo kalendāro plānu vienai tēmai,
 * t.i., kādas nodarbības notiek, ar kādu stundu apjomu.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarPlanDTO {

    // Tēmas nosaukums, kurai šis plāns pieder
    private String topicTitle;

    // Nodarbības, kas saistītas ar šo tēmu (lekcijas, semināri u.c.)
    private List<SessionDTO> sessions;
}
