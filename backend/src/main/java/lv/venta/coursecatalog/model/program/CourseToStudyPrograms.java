package lv.venta.coursecatalog.model.program;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.course.CourseVersion;

import java.io.Serializable;

/**
 * Entītija, kas attēlo daudz-pret-daudz (n:m) attiecību starp kursa versijām un studiju programmām.
 * Sasaiste ir versionēta — katra CourseVersion var pievienot/noņemt programmas, neietekmējot citas versijas.
 */
@Entity
@Table(name = "course_to_study_programs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class CourseToStudyPrograms implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Kursa versija, kas ir piesaistīta studiju programmai.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_version_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CourseVersion courseVersion;

    /**
     * Studiju programma, kurai piesaistīts kurss.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudyProgram program;

    /**
     * Programmas daļa — piem., A, B, C. Nullable, jo var tikt piešķirta vēlāk.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "program_part_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudyProgramPart programPart;
}
