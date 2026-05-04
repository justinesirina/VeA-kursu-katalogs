package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Viena kataloga rinda (F5).
 * Apvieno Course pamatlaukus ar atspoguļotās versijas (parasti aktīvās
 * apstiprinātās; staff režīmā arī citas) metadatus, lai frontends var
 * renderēt karti vai tabulas rindu bez papildu pieprasījumiem.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseCatalogItemDTO {

    private UUID courseId;
    private String courseCode;
    private String titleLv;
    private String titleEn;
    private int credits;

    private UUID versionId;
    private Integer versionNumber;
    private String statusName;
    private String facultyName;
    private String academicYearName;
    private String semesterName;

    private List<PersonRef> authors;
    private List<PersonRef> teachers;
    private List<ProgramRef> programs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonRef {
        private Integer userId;
        private String name;
        private String surname;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgramRef {
        private Integer programId;
        private String programName;
        private Integer programPartId;
        private String programPartName;
    }
}
