package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO, kas apraksta viena kursa piesaisti vienai studiju programmai ar programmas daļu.
 * Izmanto CourseDetailsDTO.studyPrograms laukā gan skatīšanas, gan rediģēšanas vajadzībām.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyProgramLinkDTO {

    // CourseToStudyPrograms ieraksta ID (vajadzīgs rediģēšanai un dzēšanai)
    private int id;

    private int programId;
    private String programName;

    // Nullable — ja programmas daļa nav vēl piešķirta
    private Integer partId;
    private String partName;
}
