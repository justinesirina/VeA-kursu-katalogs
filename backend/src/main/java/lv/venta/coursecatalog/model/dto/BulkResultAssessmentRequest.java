package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Masveida upsert pieprasījums SKR × vērtēšanas komponenšu matricai.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkResultAssessmentRequest {
    private List<ResultAssessmentFullDTO> entries;
}
