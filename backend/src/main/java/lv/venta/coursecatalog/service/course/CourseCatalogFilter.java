package lv.venta.coursecatalog.service.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Pieprasījuma parametru kopa /api/courses/catalog endpointam.
 * Visi lauki neobligāti — null vai tukšs saraksts nozīmē "filtrs neaktīvs".
 * Saraksta formātā filtri ir multi-select (atļauj pa OR-ed vērtībām vienā
 * dimensijā, piem., faculty IN (1, 2, 3)).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCatalogFilter {

    private String q;

    private List<Integer> facultyIds;
    private List<Integer> academicYearIds;
    private List<Integer> semesterIds;
    private List<Integer> statusIds;

    private List<Integer> programIds;
    private List<Integer> programPartIds;

    private List<Integer> authorUserIds;
    private List<Integer> teacherUserIds;
}
