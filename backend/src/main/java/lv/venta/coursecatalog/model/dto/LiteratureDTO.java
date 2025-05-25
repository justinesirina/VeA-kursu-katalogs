package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO klase, kas satur vienu literatūras avotu (formatēts citāts + saite, ja pievienota).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiteratureDTO {

    // Formatēts bibliogrāfisks ieraksts
    private String citation;

    // Hipersaite uz resursu (ja pieejams), var būt null
    private String url;
}
