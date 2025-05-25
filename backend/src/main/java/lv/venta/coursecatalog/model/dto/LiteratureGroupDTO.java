package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO klase literatūras sadaļai – satur literatūras veidu
 * (piemēram: Pamatliteratūra) un attiecīgo ierakstu sarakstu.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiteratureGroupDTO {

    // Literatūras veids (piemēram, “Pamatliteratūra”)
    private String type;

    // Literatūras ieraksti šajā grupā
    private List<LiteratureDTO> sources;
}
