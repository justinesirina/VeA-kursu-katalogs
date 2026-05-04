package lv.venta.coursecatalog.service.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Pieprasījuma parametru kopa /api/courses/catalog endpointam.
 * Visi lauki neobligāti, null nozīmē "filtrs neaktīvs".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCatalogFilter {

    private String q;

    private Integer facultyId;
    private Integer academicYearId;
    private Integer semesterId;
    private Integer statusId;

    private Integer programId;
    private Integer programPartId;

    private Integer authorUserId;
    private Integer teacherUserId;

    private Boolean freeElectiveOnly;
}
