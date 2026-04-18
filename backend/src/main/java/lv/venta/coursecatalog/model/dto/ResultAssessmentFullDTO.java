package lv.venta.coursecatalog.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO ar pilniem ID SKR × vērtēšanas komponenšu matricas rediģēšanai.
 * Atspoguļo vienu rindu tabulā course_result_assessments.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultAssessmentFullDTO {

    private UUID courseResultId;

    private int componentId;

    @JsonProperty("isUsed")
    private boolean isUsed;
}
